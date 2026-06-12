// Jenkinsfile — multibranch pipeline for arcana-angular
// Adapted from legacy angular-app-pipeline XML config.
//
// Key differences from the legacy XML-embedded script:
//   * `checkout scm` (no hardcoded branch=main)        — supports every branch + every PR
//   * `pollSCM` trigger removed                        — Jenkins multibranch + GitHub webhook drive triggers
//   * `dir("${env.PROJECTS_DIR}/arcana-angular")` blocks REMOVED — multibranch uses workspace root
//   * "Push to Registry" + "Arch Qube Metrics" gated   — only main pushes to registry; PR builds stay local
//   * SonarQube gets pullrequest.* params on PRs       — PR-decoration in Sonar UI

pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '1'))
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        APP_NAME  = "angular-app"
        REGISTRY  = "localhost:5000"
        IMAGE_TAG = "${REGISTRY}/arcana/${APP_NAME}"
        VERSION   = "1.0.0"
    }

    stages {
        stage("Checkout") {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
                script {
                    echo "Branch: ${env.BRANCH_NAME ?: 'unknown'}"
                    echo "PR: ${env.CHANGE_ID ?: 'no'} (target: ${env.CHANGE_TARGET ?: 'n/a'})"
                }
            }
        }

        stage("Cleanup Old Images") {
            steps {
                sh '''
                    # keep only the previous build image (layer cache); the
                    # registry holds every build-N tag durably
                    docker images --format '{{.Repository}}:{{.Tag}}' \
                        | grep -E "^${IMAGE_TAG}:build-[0-9]+$" \
                        | sed 's/.*:build-//' | sort -rn | tail -n +2 \
                        | sed "s|^|${IMAGE_TAG}:build-|" \
                        | xargs -r docker rmi 2>/dev/null || true
                    # Stop leftover test containers
                    docker compose -f docker-compose.test.yml down \
                        --remove-orphans 2>/dev/null || true
                '''
            }
        }

        stage("Docker Compose Build") {
            steps {
                sh "VERSION=${VERSION} docker compose -f docker-compose.ci.yml build"
                sh "docker tag localhost:5000/arcana/${APP_NAME}:${VERSION} ${IMAGE_TAG}:build-${BUILD_NUMBER}"
            }
        }

        stage("Test Coverage") {
            // Blocking: failing tests fail the build. DinD-safe coverage export: the
            // ./coverage bind mount is dropped (the host daemon resolves it to a stray
            // path the Jenkins workspace cannot read, so SonarQube imported empty
            // coverage = gate ERROR). Run a NAMED container, then docker cp the report
            // into the workspace for sonar-scanner to pick up.
            steps {
                sh '''
                    set -e
                    # Per-build container name: a static name collides when a concurrent
                    # build on the shared daemon claims it during the ~80s image-build
                    # window between `rm` and `run`. Mirror the ${BUILD_NUMBER} pattern
                    # already used by the Architecture Qube stage.
                    TEST_CTR="angular-test-${BUILD_NUMBER}"
                    docker rm -f "$TEST_CTR" 2>/dev/null || true
                    docker compose -f docker-compose.test.yml run --build --name "$TEST_CTR" test
                    mkdir -p coverage
                    docker cp "$TEST_CTR":/app/coverage/. coverage/
                    docker rm -f "$TEST_CTR" 2>/dev/null || true
                '''
            }
        }

        stage("SonarQube Analysis") {
            // Blocking quality gate: build FAILS if the gate is not OK. Community Build
            // has no server->Jenkins webhook, so poll the compute-engine task named in
            // .scannerwork/report-task.txt and read the gate status by THIS run's
            // analysisId. No sonar.pullrequest.* params (Community Build rejects them).
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh "sonar-scanner -Dsonar.projectKey=angular-app -Dsonar.scm.disabled=true"
                    sh '''
                        set -e
                        TOKEN="${SONAR_AUTH_TOKEN:-$SONAR_TOKEN}"
                        RT=.scannerwork/report-task.txt
                        [ -f "$RT" ] || { echo "report-task.txt not found — scanner did not run"; exit 1; }
                        CE_TASK_ID=$(grep '^ceTaskId=' "$RT" | cut -d= -f2-)
                        echo "CE task id: $CE_TASK_ID"
                        ANALYSIS_ID=""
                        for i in $(seq 1 60); do
                            RESP=$(curl -s -u "$TOKEN:" "$SONAR_HOST_URL/api/ce/task?id=$CE_TASK_ID")
                            ST=$(echo "$RESP" | grep -o '"status":"[A-Z_]*"' | head -1 | cut -d'"' -f4)
                            echo "  CE status: ${ST:-?} (try $i)"
                            if [ "$ST" = "SUCCESS" ]; then
                                ANALYSIS_ID=$(echo "$RESP" | grep -o '"analysisId":"[^"]*"' | head -1 | cut -d'"' -f4)
                                break
                            elif [ "$ST" = "FAILED" ] || [ "$ST" = "CANCELED" ]; then
                                echo "CE task ended $ST"; exit 1
                            fi
                            sleep 5
                        done
                        [ -n "$ANALYSIS_ID" ] || { echo "CE task did not finish in time"; exit 1; }
                        GATE=$(curl -s -u "$TOKEN:" "$SONAR_HOST_URL/api/qualitygates/project_status?analysisId=$ANALYSIS_ID")
                        GST=$(echo "$GATE" | grep -o '"status":"[A-Z]*"' | head -1 | cut -d'"' -f4)
                        echo "Quality gate: ${GST:-UNKNOWN}"
                        if [ "$GST" != "OK" ]; then
                            echo "--- gate response ---"; echo "$GATE"
                            exit 1
                        fi
                    '''
                }
            }
        }

        stage("Architecture Qube") {
            // Blocking: arch-qube exits non-zero if score < --threshold 90. DinD-safe:
            // bind mounts resolve on the host daemon, so source is copied IN via a tar
            // stream and the report copied OUT through anonymous volumes (/src, /output).
            steps {
                sh '''
                    docker rm -f arcana-arch-qube-angular-${BUILD_NUMBER} 2>/dev/null || true
                    docker create --name arcana-arch-qube-angular-${BUILD_NUMBER} --network devops_default \
                        -v /src -v /output \
                        arcana.boo/arcana/arch-qube:latest \
                        scan /src --framework angular --no-ai --ci \
                        --format json,markdown -o /output --threshold 90 || exit 1
                    tar --exclude=./.git --exclude=./node_modules --exclude=./dist \
                        --exclude=./.angular --exclude=./coverage --exclude=./.scannerwork \
                        --exclude=./arch-qube-reports -C . -cf - . \
                        | docker cp - arcana-arch-qube-angular-${BUILD_NUMBER}:/src || exit 1
                    docker start -a arcana-arch-qube-angular-${BUILD_NUMBER}
                    AQ_RC=$?
                    mkdir -p arch-qube-reports
                    docker cp arcana-arch-qube-angular-${BUILD_NUMBER}:/output/. arch-qube-reports/ 2>/dev/null || true
                    docker rm -f arcana-arch-qube-angular-${BUILD_NUMBER} 2>/dev/null || true
                    exit $AQ_RC
                '''
            }
        }

        stage("Image Info") {
            steps {
                sh "docker images --format 'table {{.Repository}}:{{.Tag}}\\t{{.Size}}' | grep ${APP_NAME} || true"
            }
        }

        stage("Push to Registry") {
            // Only push from main branch builds. PR builds keep the image local
            // for tests but don't pollute the registry with PR tags.
            when { branch 'main' }
            steps {
                sh "docker push ${IMAGE_TAG}:${VERSION}"
                sh "docker push ${IMAGE_TAG}:build-${BUILD_NUMBER}"
            }
        }

        stage("Arch Qube Metrics") {
            // Metrics script writes to shared report dir, only run for main.
            when { branch 'main' }
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                    sh "bash /data/projects/_scripts/arch-qube-metrics.sh \$(pwd) arcana-angular || true"
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS - ${APP_NAME}:${VERSION} branch=${env.BRANCH_NAME ?: '?'} pr=${env.CHANGE_ID ?: 'no'}"
            sh '''
                # self-clean: keep only THIS build's image locally; previous
                # build-N tags stay pullable from the registry
                docker images --format '{{.Repository}}:{{.Tag}}' \
                    | grep -E "^${IMAGE_TAG}:build-[0-9]+$" \
                    | grep -v ":build-${BUILD_NUMBER}$" \
                    | xargs -r docker rmi 2>/dev/null || true
            '''
        }
        failure { echo "Pipeline FAILED - branch=${env.BRANCH_NAME ?: '?'} pr=${env.CHANGE_ID ?: 'no'}" }
        always  { echo "Build number ${BUILD_NUMBER} done" }
    }
}

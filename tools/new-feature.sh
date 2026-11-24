#!/usr/bin/env bash
# Add one vertical slice (entity + list page) in this template's layered architecture.
#
#   tools/new-feature.sh Invoice
#
# Generates, exactly like the User feature (AGENTS.md §2):
#   domain/entities/<x>.model.ts            entity + Create/Update DTOs
#   data/dto/<x>.dto.ts                     API (snake_case) DTOs
#   data/mappers/<x>.mapper.ts              DTO <-> entity
#   dao/<x>.dao.ts + dao/impl/<x>.dao.impl.ts                         HTTP via ApiService
#   repository/<x>.repository.ts + repository/impl/<x>.repository.impl.ts  Memory -> LRU -> DAO cache
#   domain/services/<x>.service.ts          business rules, injects the repository TOKEN
#   presentation/features/<xs>/<x>-list/    component + ViewModel (Input/Output/Effect) + html/scss
#   presentation/features/<xs>/<xs>.routes.ts, a lazy route in app.routes.ts
#   tokens in dao/index.ts + repository/repository.tokens.ts, providers in app.config.ts
#   *.spec.ts for mapper, DAO, repository, service, ViewModel, component
# Fails loudly (exit 1) when an anchor in the existing files is missing or a file exists.
set -euo pipefail

[ $# -eq 1 ] || { echo "usage: $0 <PascalCaseName>   e.g. $0 Invoice" >&2; exit 1; }
NAME="$1"
[[ "$NAME" =~ ^[A-Z][a-zA-Z0-9]*$ ]] || { echo "name must be PascalCase (e.g. Invoice, PurchaseOrder)" >&2; exit 1; }
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/src/app"

CAMEL="$(printf '%s' "${NAME:0:1}" | tr 'A-Z' 'a-z')${NAME:1}"
KEBAB="$(printf '%s' "$NAME" | perl -pe 's/(?<!^)([A-Z])/-$1/g; $_=lc')"
UPPER="$(printf '%s' "$KEBAB" | tr 'a-z-' 'A-Z_')"
case "$KEBAB" in *s) PLURAL="${KEBAB}es" ;; *y) PLURAL="${KEBAB%y}ies" ;; *) PLURAL="${KEBAB}s" ;; esac
case "$CAMEL" in *s) CPLURAL="${CAMEL}es" ;; *y) CPLURAL="${CAMEL%y}ies" ;; *) CPLURAL="${CAMEL}s" ;; esac

die() { echo "new-feature: $*" >&2; exit 1; }
# Anchors in existing files. If the template changed, fix this script — do not hand-wire.
need() { grep -qF -- "$2" "$1" || die "anchor not found in ${1#$ROOT/}: '$2' — template changed; update tools/new-feature.sh"; }
need "$APP/app.config.ts"            "import { UserRepositoryImpl } from './repository/impl/user.repository.impl';"
need "$APP/app.config.ts"            "{ provide: USER_REPOSITORY_TOKEN, useClass: UserRepositoryImpl },"
need "$APP/app.routes.ts"            "path: '**',"
need "$APP/dao/index.ts"             "// ── Public API"
need "$APP/repository/repository.tokens.ts" "export const USER_REPOSITORY_TOKEN"
need "$APP/repository/index.ts"      "export * from './repository.tokens';"
grep -qF "${UPPER}_REPOSITORY_TOKEN" "$APP/repository/repository.tokens.ts" && die "${NAME} already exists (token ${UPPER}_REPOSITORY_TOKEN)"

FEAT="presentation/features/$PLURAL/$KEBAB-list"
FILES=(
  "domain/entities/$KEBAB.model.ts" "domain/entities/$KEBAB.model.spec.ts"
  "data/dto/$KEBAB.dto.ts" "data/mappers/$KEBAB.mapper.ts" "data/mappers/$KEBAB.mapper.spec.ts"
  "dao/$KEBAB.dao.ts" "dao/impl/$KEBAB.dao.impl.ts" "dao/impl/$KEBAB.dao.impl.spec.ts"
  "repository/$KEBAB.repository.ts" "repository/impl/$KEBAB.repository.impl.ts" "repository/impl/$KEBAB.repository.impl.spec.ts"
  "domain/services/$KEBAB.service.ts" "domain/services/$KEBAB.service.spec.ts"
  "presentation/features/$PLURAL/$PLURAL.routes.ts"
  "$FEAT/$KEBAB-list.view-model.ts" "$FEAT/$KEBAB-list.view-model.spec.ts"
  "$FEAT/$KEBAB-list.component.ts" "$FEAT/$KEBAB-list.component.html" "$FEAT/$KEBAB-list.component.scss"
  "$FEAT/$KEBAB-list.component.spec.ts"
)
for f in "${FILES[@]}"; do [ ! -e "$APP/$f" ] || die "src/app/$f already exists"; done

sub() { perl -pe "s/__Name__/$NAME/g; s/__name__/$CAMEL/g; s/__names__/$CPLURAL/g; s/__kebab__/$KEBAB/g; s/__kebabs__/$PLURAL/g; s/__UPPER__/$UPPER/g"; }
emit() { mkdir -p "$(dirname "$APP/$1")"; sub > "$APP/$1"; }

# ───────────────────────── domain/entities ─────────────────────────
emit "domain/entities/$KEBAB.model.ts" <<'T'
/**
 * __Name__ domain entity (camelCase, framework-free). API shapes live in data/dto/.
 */
export interface __Name__ {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create__Name__Dto {
  name: string;
  description?: string;
}

export interface Update__Name__Dto {
  name?: string;
  description?: string;
}

/** Business validation for __Name__ input. Returns error keys; empty = valid. */
export const __Name__Validator = {
  validateCreate(dto: Create__Name__Dto): string[] {
    const errors: string[] = [];
    if (!dto.name || dto.name.trim().length === 0) {
      errors.push('__name__.name.required');
    }
    return errors;
  },
};
T
emit "domain/entities/$KEBAB.model.spec.ts" <<'T'
import { __Name__Validator } from './__kebab__.model';

describe('__Name__Validator', () => {
  it('accepts a named __name__', () => {
    expect(__Name__Validator.validateCreate({ name: 'A' })).toEqual([]);
  });

  it('rejects a blank name', () => {
    expect(__Name__Validator.validateCreate({ name: '  ' })).toEqual(['__name__.name.required']);
  });
});
T

# ───────────────────────── data/dto + data/mappers ─────────────────────────
emit "data/dto/$KEBAB.dto.ts" <<'T'
/** API shapes for __Name__ (snake_case, exactly what the server sends). */
export interface __Name__Dto {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Paginated__Name__ResponseDto {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: __Name__Dto[];
}

export interface Single__Name__ResponseDto {
  data: __Name__Dto;
}

export interface Create__Name__RequestDto {
  name: string;
  description?: string;
}

export interface Update__Name__RequestDto {
  name?: string;
  description?: string;
}
T
emit "data/mappers/$KEBAB.mapper.ts" <<'T'
import { __Name__Dto, Create__Name__RequestDto, Update__Name__RequestDto } from '../dto/__kebab__.dto';
import { __Name__, Create__Name__Dto, Update__Name__Dto } from '../../domain/entities/__kebab__.model';

/** Converts between __Name__ API DTOs and the domain entity. */
export class __Name__Mapper {
  static toDomain(dto: __Name__Dto): __Name__ {
    return {
      id: dto.id.toString(),
      name: dto.name,
      description: dto.description,
      createdAt: dto.created_at ? new Date(dto.created_at) : new Date(),
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : new Date(),
    };
  }

  static toDomainList(dtos: __Name__Dto[]): __Name__[] {
    return dtos.map(dto => __Name__Mapper.toDomain(dto));
  }

  static toCreateRequest(dto: Create__Name__Dto): Create__Name__RequestDto {
    return { name: dto.name, description: dto.description };
  }

  static toUpdateRequest(dto: Update__Name__Dto): Update__Name__RequestDto {
    return { name: dto.name, description: dto.description };
  }
}
T
emit "data/mappers/$KEBAB.mapper.spec.ts" <<'T'
import { __Name__Mapper } from './__kebab__.mapper';

describe('__Name__Mapper', () => {
  it('maps a DTO to the domain entity', () => {
    const entity = __Name__Mapper.toDomain({ id: 7, name: 'A', created_at: '2024-01-01T00:00:00Z' });
    expect(entity.id).toBe('7');
    expect(entity.name).toBe('A');
    expect(entity.createdAt.getUTCFullYear()).toBe(2024);
  });

  it('maps create and update requests', () => {
    expect(__Name__Mapper.toCreateRequest({ name: 'A', description: 'd' })).toEqual({ name: 'A', description: 'd' });
    expect(__Name__Mapper.toUpdateRequest({ name: 'B' })).toEqual({ name: 'B', description: undefined });
  });
});
T

# ───────────────────────── dao ─────────────────────────
emit "dao/$KEBAB.dao.ts" <<'T'
import { Observable } from 'rxjs';
import {
  __Name__Dto,
  Paginated__Name__ResponseDto,
  Single__Name__ResponseDto,
  Create__Name__RequestDto,
  Update__Name__RequestDto,
} from '../data/dto/__kebab__.dto';

/** HTTP-level DAO for __Name__ resources: raw DTOs only, no mapping, no caching. */
export interface I__Name__Dao {
  get__Name__s(page: number, pageSize: number): Observable<Paginated__Name__ResponseDto>;
  get__Name__ById(id: string): Observable<Single__Name__ResponseDto>;
  create__Name__(data: Create__Name__RequestDto): Observable<__Name__Dto>;
  update__Name__(id: string, data: Update__Name__RequestDto): Observable<__Name__Dto>;
  delete__Name__(id: string): Observable<void>;
}
T
emit "dao/impl/$KEBAB.dao.impl.ts" <<'T'
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../data/api/api.service';
import { I__Name__Dao } from '../__kebab__.dao';
import {
  __Name__Dto,
  Paginated__Name__ResponseDto,
  Single__Name__ResponseDto,
  Create__Name__RequestDto,
  Update__Name__RequestDto,
} from '../../data/dto/__kebab__.dto';

/** __Name__ DAO backed by ApiService. Bound to __UPPER___DAO_TOKEN in app.config.ts only. */
@Injectable()
export class __Name__DaoImpl implements I__Name__Dao {
  private readonly apiService = inject(ApiService);

  get__Name__s(page: number, pageSize: number): Observable<Paginated__Name__ResponseDto> {
    return this.apiService.get<Paginated__Name__ResponseDto>(`/__kebabs__?page=${page}&per_page=${pageSize}`);
  }

  get__Name__ById(id: string): Observable<Single__Name__ResponseDto> {
    return this.apiService.get<Single__Name__ResponseDto>(`/__kebabs__/${id}`);
  }

  create__Name__(data: Create__Name__RequestDto): Observable<__Name__Dto> {
    return this.apiService.post<__Name__Dto>('/__kebabs__', data);
  }

  update__Name__(id: string, data: Update__Name__RequestDto): Observable<__Name__Dto> {
    return this.apiService.put<__Name__Dto>(`/__kebabs__/${id}`, data);
  }

  delete__Name__(id: string): Observable<void> {
    return this.apiService.delete<void>(`/__kebabs__/${id}`);
  }
}
T
emit "dao/impl/$KEBAB.dao.impl.spec.ts" <<'T'
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { __Name__DaoImpl } from './__kebab__.dao.impl';
import { ApiService } from '../../data/api/api.service';

describe('__Name__DaoImpl', () => {
  let dao: __Name__DaoImpl;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    TestBed.configureTestingModule({
      providers: [__Name__DaoImpl, { provide: ApiService, useValue: mockApiService }],
    });
    dao = TestBed.inject(__Name__DaoImpl);
  });

  it('GETs a page', () => {
    mockApiService.get.and.returnValue(of({ page: 1, per_page: 10, total: 0, total_pages: 0, data: [] }));
    dao.get__Name__s(1, 10).subscribe();
    expect(mockApiService.get).toHaveBeenCalledWith('/__kebabs__?page=1&per_page=10');
  });

  it('GETs, POSTs, PUTs and DELETEs by id', () => {
    mockApiService.get.and.returnValue(of({ data: { id: 1, name: 'A' } }));
    mockApiService.post.and.returnValue(of({ id: 1, name: 'A' }));
    mockApiService.put.and.returnValue(of({ id: 1, name: 'B' }));
    mockApiService.delete.and.returnValue(of(undefined));
    dao.get__Name__ById('1').subscribe();
    dao.create__Name__({ name: 'A' }).subscribe();
    dao.update__Name__('1', { name: 'B' }).subscribe();
    dao.delete__Name__('1').subscribe();
    expect(mockApiService.get).toHaveBeenCalledWith('/__kebabs__/1');
    expect(mockApiService.post).toHaveBeenCalledWith('/__kebabs__', { name: 'A' });
    expect(mockApiService.put).toHaveBeenCalledWith('/__kebabs__/1', { name: 'B' });
    expect(mockApiService.delete).toHaveBeenCalledWith('/__kebabs__/1');
  });
});
T

# ───────────────────────── repository ─────────────────────────
emit "repository/$KEBAB.repository.ts" <<'T'
import { Observable } from 'rxjs';
import { BaseRepository } from './base.repository';
import { __Name__, Create__Name__Dto, Update__Name__Dto } from '../domain/entities/__kebab__.model';
import { PaginatedResponse, PaginationParams } from '../domain/entities/pagination.model';

/** Repository contract for __Name__. Services inject it via __UPPER___REPOSITORY_TOKEN. */
export interface __Name__Repository extends BaseRepository<__Name__, string> {
  findPaginated(params: PaginationParams): Observable<PaginatedResponse<__Name__>>;
  create(dto: Create__Name__Dto): Observable<__Name__>;
  update(id: string, dto: Update__Name__Dto): Observable<__Name__>;
}
T
emit "repository/impl/$KEBAB.repository.impl.ts" <<'T'
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, map, tap } from 'rxjs';

import { __Name__Repository } from '../__kebab__.repository';
import { __UPPER___DAO_TOKEN } from '../../dao/index';
import { I__Name__Dao } from '../../dao/__kebab__.dao';

import { __Name__, Create__Name__Dto, Update__Name__Dto } from '../../domain/entities/__kebab__.model';
import { PaginatedResponse, PaginationParams } from '../../domain/entities/pagination.model';
import { ErrorCategory, createAppError } from '../../domain/entities/app-error.model';

import { CacheService } from '../../data/storage/cache.service';
import { MemoryCacheService } from '../../data/storage/memory-cache.service';
import { NetworkStatusService } from '../../domain/services/network-status.service';
import { __Name__Mapper } from '../../data/mappers/__kebab__.mapper';

/**
 * __Name__ repository: Memory cache -> LRU cache (TTL) -> DAO (HTTP).
 * Offline with nothing cached = NETWORK error. Persistent offline storage (IndexedDB) needs a
 * table in data/storage/indexed-db.service.ts — see UserRepositoryImpl for the full 4-layer version.
 */
@Injectable()
export class __Name__RepositoryImpl implements __Name__Repository {
  private readonly dao: I__Name__Dao = inject(__UPPER___DAO_TOKEN);
  private readonly memoryCache = inject(MemoryCacheService);
  private readonly lruCache = inject(CacheService);
  private readonly networkStatus = inject(NetworkStatusService);

  private readonly cacheKeyPrefix = '__name__';

  save(entity: __Name__): Observable<__Name__> {
    return this.create({ name: entity.name, description: entity.description });
  }

  findById(id: string): Observable<__Name__> {
    return this.dao.get__Name__ById(id).pipe(map(res => __Name__Mapper.toDomain(res.data)));
  }

  findAll(): Observable<__Name__[]> {
    return this.findPaginated({ page: 1, pageSize: 100 }).pipe(map(res => res.data));
  }

  count(): Observable<number> {
    return this.findPaginated({ page: 1, pageSize: 1 }).pipe(map(res => res.total));
  }

  deleteById(id: string): Observable<void> {
    return this.dao.delete__Name__(id).pipe(tap(() => this.invalidate()));
  }

  findPaginated(params: PaginationParams): Observable<PaginatedResponse<__Name__>> {
    const key = `${this.cacheKeyPrefix}:list:${params.page}:${params.pageSize}`;
    const mem = this.memoryCache.get<PaginatedResponse<__Name__>>(key);
    if (mem) {
      return of(mem);
    }
    const lru = this.lruCache.get<PaginatedResponse<__Name__>>(key);
    if (lru) {
      this.memoryCache.set(key, lru);
      return of(lru);
    }
    if (this.networkStatus.isOffline) {
      return throwError(() =>
        createAppError(new Error('No offline data available'), ErrorCategory.NETWORK, 'error.network')
      );
    }
    return this.dao.get__Name__s(params.page, params.pageSize).pipe(
      map(res => ({
        data: __Name__Mapper.toDomainList(res.data),
        page: res.page,
        pageSize: res.per_page,
        total: res.total,
        totalPages: res.total_pages,
      })),
      tap(result => {
        this.memoryCache.set(key, result);
        this.lruCache.set(key, result);
      })
    );
  }

  create(dto: Create__Name__Dto): Observable<__Name__> {
    return this.dao.create__Name__(__Name__Mapper.toCreateRequest(dto)).pipe(
      map(res => __Name__Mapper.toDomain(res)),
      tap(() => this.invalidate())
    );
  }

  update(id: string, dto: Update__Name__Dto): Observable<__Name__> {
    return this.dao.update__Name__(id, __Name__Mapper.toUpdateRequest(dto)).pipe(
      map(res => __Name__Mapper.toDomain(res)),
      tap(() => this.invalidate())
    );
  }

  private invalidate(): void {
    // List pages are keyed by page/size; drop both cache layers for this entity.
    this.memoryCache.clear();
    this.lruCache.clear();
  }
}
T
emit "repository/impl/$KEBAB.repository.impl.spec.ts" <<'T'
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { __Name__RepositoryImpl } from './__kebab__.repository.impl';
import { __UPPER___DAO_TOKEN } from '../../dao/index';
import { I__Name__Dao } from '../../dao/__kebab__.dao';
import { CacheService } from '../../data/storage/cache.service';
import { MemoryCacheService } from '../../data/storage/memory-cache.service';
import { NetworkStatusService } from '../../domain/services/network-status.service';

describe('__Name__RepositoryImpl', () => {
  let repo: __Name__RepositoryImpl;
  let dao: jasmine.SpyObj<I__Name__Dao>;
  let network: { isOffline: boolean };

  beforeEach(() => {
    dao = jasmine.createSpyObj('I__Name__Dao', ['get__Name__s', 'get__Name__ById', 'create__Name__', 'update__Name__', 'delete__Name__']);
    dao.get__Name__s.and.returnValue(of({ page: 1, per_page: 10, total: 1, total_pages: 1, data: [{ id: 1, name: 'A' }] }));
    dao.create__Name__.and.returnValue(of({ id: 2, name: 'B' }));
    network = { isOffline: false };
    TestBed.configureTestingModule({
      providers: [
        __Name__RepositoryImpl,
        MemoryCacheService,
        CacheService,
        { provide: __UPPER___DAO_TOKEN, useValue: dao },
        { provide: NetworkStatusService, useValue: network },
      ],
    });
    TestBed.inject(MemoryCacheService).clear();
    TestBed.inject(CacheService).clear();
    repo = TestBed.inject(__Name__RepositoryImpl);
  });

  it('fetches from the DAO, then serves the second call from cache', () => {
    let first: string | undefined;
    repo.findPaginated({ page: 1, pageSize: 10 }).subscribe(r => (first = r.data[0].name));
    repo.findPaginated({ page: 1, pageSize: 10 }).subscribe();
    expect(first).toBe('A');
    expect(dao.get__Name__s).toHaveBeenCalledTimes(1);
  });

  it('errors offline when nothing is cached', () => {
    network.isOffline = true;
    let failed = false;
    repo.findPaginated({ page: 1, pageSize: 10 }).subscribe({ error: () => (failed = true) });
    expect(failed).toBeTrue();
    expect(dao.get__Name__s).not.toHaveBeenCalled();
  });

  it('invalidates the cache after create', () => {
    repo.findPaginated({ page: 1, pageSize: 10 }).subscribe();
    repo.create({ name: 'B' }).subscribe();
    repo.findPaginated({ page: 1, pageSize: 10 }).subscribe();
    expect(dao.get__Name__s).toHaveBeenCalledTimes(2);
  });
});
T

# ───────────────────────── domain/services ─────────────────────────
emit "domain/services/$KEBAB.service.ts" <<'T'
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { __Name__Repository } from '../../repository/__kebab__.repository';
import { __UPPER___REPOSITORY_TOKEN } from '../../repository/repository.tokens';
import { __Name__, Create__Name__Dto, __Name__Validator } from '../entities/__kebab__.model';
import { PaginatedResponse, PaginationParams } from '../entities/pagination.model';
import { ErrorCategory, createAppError } from '../entities/app-error.model';

/** __Name__ business rules. Depends on the repository interface only (via its token). */
@Injectable({ providedIn: 'root' })
export class __Name__Service {
  private readonly repository: __Name__Repository = inject(__UPPER___REPOSITORY_TOKEN);

  get__Name__s(params: PaginationParams = { page: 1, pageSize: 10 }): Observable<PaginatedResponse<__Name__>> {
    return this.repository.findPaginated(params).pipe(
      catchError(error => throwError(() => createAppError(error, ErrorCategory.UNKNOWN, 'Failed to load __kebabs__')))
    );
  }

  create__Name__(dto: Create__Name__Dto): Observable<__Name__> {
    const errors = __Name__Validator.validateCreate(dto);
    if (errors.length > 0) {
      return throwError(() => createAppError(new Error(errors.join(', ')), ErrorCategory.VALIDATION, errors[0]));
    }
    return this.repository.create(dto);
  }

  delete__Name__(id: string): Observable<void> {
    return this.repository.deleteById(id);
  }
}
T
emit "domain/services/$KEBAB.service.spec.ts" <<'T'
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { __Name__Service } from './__kebab__.service';
import { __UPPER___REPOSITORY_TOKEN } from '../../repository/repository.tokens';
import { __Name__Repository } from '../../repository/__kebab__.repository';

describe('__Name__Service', () => {
  let service: __Name__Service;
  let repo: jasmine.SpyObj<__Name__Repository>;

  beforeEach(() => {
    repo = jasmine.createSpyObj('__Name__Repository', ['findPaginated', 'create', 'deleteById']);
    TestBed.configureTestingModule({
      providers: [{ provide: __UPPER___REPOSITORY_TOKEN, useValue: repo }],
    });
    service = TestBed.inject(__Name__Service);
  });

  it('loads a page through the repository', () => {
    repo.findPaginated.and.returnValue(of({ data: [], page: 1, pageSize: 10, total: 0, totalPages: 0 }));
    service.get__Name__s().subscribe();
    expect(repo.findPaginated).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it('rejects an invalid create without touching the repository', () => {
    let failed = false;
    service.create__Name__({ name: '' }).subscribe({ error: () => (failed = true) });
    expect(failed).toBeTrue();
    expect(repo.create).not.toHaveBeenCalled();
  });
});
T

# ───────────────────────── presentation ─────────────────────────
emit "presentation/features/$PLURAL/$PLURAL.routes.ts" <<'T'
import { Routes } from '@angular/router';

/** __Name__ feature routes (lazy-loaded from app.routes.ts). */
export const __UPPER__S_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./__kebab__-list/__kebab__-list.component').then(m => m.__Name__ListComponent),
  },
];
T
emit "$FEAT/$KEBAB-list.view-model.ts" <<'T'
import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { __Name__Service } from '../../../../domain/services/__kebab__.service';
import { __Name__ } from '../../../../domain/entities/__kebab__.model';
import { AppError } from '../../../../domain/models/app-error';
import { ErrorHandlerService } from '../../../../domain/services/error-handler.service';
import { BaseViewModel } from '../../../shared/base';

/** __Name__ list ViewModel — Input (actions) / Output (signals) / Effect (one-shot events). */
@Injectable()
export class __Name__ListViewModel extends BaseViewModel {
  private readonly service = inject(__Name__Service);
  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly itemsSignal = signal<__Name__[]>([]);
  private readonly isLoadingSignal = signal(false);
  private readonly errorSignal = signal<AppError | null>(null);

  // ========== INPUT (Actions) ==========
  readonly input = {
    load: () => this.load(),
    clearError: () => this.errorSignal.set(null),
  };

  // ========== OUTPUT (State) ==========
  readonly output = {
    items: computed(() => this.itemsSignal()),
    isLoading: computed(() => this.isLoadingSignal()),
    hasError: computed(() => this.errorSignal() !== null),
    errorMessage: computed(() => this.errorSignal()?.getUserMessage() || ''),
    isEmpty: computed(() => !this.isLoadingSignal() && this.itemsSignal().length === 0),
  };

  // ========== EFFECTS (Side Effects) ==========
  readonly effect$ = {
    loadError$: new Subject<AppError>(),
  };

  private load(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    this.service.get__Name__s().subscribe({
      next: page => {
        this.itemsSignal.set(page.data);
        this.isLoadingSignal.set(false);
      },
      error: err => {
        const appError = this.errorHandler.handleError(err);
        this.errorSignal.set(appError);
        this.isLoadingSignal.set(false);
        this.effect$.loadError$.next(appError);
      },
    });
  }
}
T
emit "$FEAT/$KEBAB-list.view-model.spec.ts" <<'T'
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { __Name__ListViewModel } from './__kebab__-list.view-model';
import { __Name__Service } from '../../../../domain/services/__kebab__.service';
import { ErrorHandlerService } from '../../../../domain/services/error-handler.service';
import { AppError, ErrorType } from '../../../../domain/models/app-error';

describe('__Name__ListViewModel', () => {
  let vm: __Name__ListViewModel;
  let service: jasmine.SpyObj<__Name__Service>;
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>;

  beforeEach(() => {
    service = jasmine.createSpyObj('__Name__Service', ['get__Name__s']);
    errorHandler = jasmine.createSpyObj('ErrorHandlerService', ['handleError', 'logError']);
    TestBed.configureTestingModule({
      providers: [
        __Name__ListViewModel,
        provideRouter([]),
        { provide: __Name__Service, useValue: service },
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });
    vm = TestBed.inject(__Name__ListViewModel);
  });

  it('starts empty and not loading', () => {
    expect(vm.output.items()).toEqual([]);
    expect(vm.output.isLoading()).toBeFalse();
  });

  it('input.load fills output.items', () => {
    const item = { id: '1', name: 'A', createdAt: new Date(), updatedAt: new Date() };
    service.get__Name__s.and.returnValue(of({ data: [item], page: 1, pageSize: 10, total: 1, totalPages: 1 }));
    vm.input.load();
    expect(vm.output.items()).toEqual([item]);
    expect(vm.output.isEmpty()).toBeFalse();
  });

  it('a failed load sets the error and emits effect$.loadError$', () => {
    const appError = new AppError(ErrorType.NETWORK_ERROR, 'down');
    errorHandler.handleError.and.returnValue(appError);
    service.get__Name__s.and.returnValue(throwError(() => new Error('down')));
    let emitted: AppError | undefined;
    vm.effect$.loadError$.subscribe(e => (emitted = e));
    vm.input.load();
    expect(vm.output.hasError()).toBeTrue();
    expect(emitted).toBe(appError);
  });
});
T
emit "$FEAT/$KEBAB-list.component.ts" <<'T'
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { __Name__ListViewModel } from './__kebab__-list.view-model';
import { BaseComponent } from '../../../shared/base';

/** __Name__ list page. Talks to its ViewModel only (never to a service). */
@Component({
  selector: 'app-__kebab__-list',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  providers: [__Name__ListViewModel],
  templateUrl: './__kebab__-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './__kebab__-list.component.scss',
})
export class __Name__ListComponent extends BaseComponent implements OnInit {
  vm = inject(__Name__ListViewModel);

  items = this.vm.output.items;
  isLoading = this.vm.output.isLoading;
  hasError = this.vm.output.hasError;
  errorMessage = this.vm.output.errorMessage;
  isEmpty = this.vm.output.isEmpty;

  constructor() {
    super();
    this.setupEffects();
  }

  ngOnInit(): void {
    this.vm.input.load();
  }

  protected setupEffects(): void {
    this.vm.effect$.loadError$.pipe(takeUntil(this.destroy$)).subscribe();
  }
}
T
emit "$FEAT/$KEBAB-list.component.html" <<'T'
<div class="__kebab__-list container py-3">
  <h2>__Name__s</h2>
  @if (isLoading()) {
    <app-loading-spinner></app-loading-spinner>
  } @else if (hasError()) {
    <div class="alert alert-danger" role="alert">
      {{ errorMessage() }}
      <button type="button" class="btn btn-link" (click)="vm.input.load()">Retry</button>
    </div>
  } @else if (isEmpty()) {
    <p class="text-muted">No __kebabs__ yet.</p>
  } @else {
    <ul class="list-group">
      @for (item of items(); track item.id) {
        <li class="list-group-item">{{ item.name }}</li>
      }
    </ul>
  }
</div>
T
emit "$FEAT/$KEBAB-list.component.scss" <<'T'
.__kebab__-list {
  max-width: 960px;
}
T
emit "$FEAT/$KEBAB-list.component.spec.ts" <<'T'
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { __Name__ListComponent } from './__kebab__-list.component';
import { __Name__Service } from '../../../../domain/services/__kebab__.service';

describe('__Name__ListComponent', () => {
  let fixture: ComponentFixture<__Name__ListComponent>;
  let service: jasmine.SpyObj<__Name__Service>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('__Name__Service', ['get__Name__s']);
    service.get__Name__s.and.returnValue(
      of({ data: [{ id: '1', name: 'First', createdAt: new Date(), updatedAt: new Date() }], page: 1, pageSize: 10, total: 1, totalPages: 1 })
    );
    await TestBed.configureTestingModule({
      imports: [__Name__ListComponent],
      providers: [provideRouter([]), { provide: __Name__Service, useValue: service }],
    }).compileComponents();
    fixture = TestBed.createComponent(__Name__ListComponent);
    fixture.detectChanges();
  });

  it('renders the items the ViewModel loaded', () => {
    expect(service.get__Name__s).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('First');
  });
});
T

# ───────────────────────── wiring (tokens, DI, route) ─────────────────────────
export NAME CAMEL KEBAB UPPER PLURAL
perl -0pi -e 's|(// ── Public API[^\n]*\n)|export const $ENV{UPPER}_DAO_TOKEN = new InjectionToken<I$ENV{NAME}Dao>(\x27$ENV{NAME}Dao\x27);\n\n$1export * from \x27./$ENV{KEBAB}.dao\x27;\n|' "$APP/dao/index.ts"
perl -0pi -e 's|^(import \{ IUserDao \} from \x27./user.dao\x27;\n)|$1import { I$ENV{NAME}Dao } from \x27./$ENV{KEBAB}.dao\x27;\n|m' "$APP/dao/index.ts"
grep -qF "I${NAME}Dao } from './${KEBAB}.dao'" "$APP/dao/index.ts" || die "could not add the DAO import to dao/index.ts (anchor: import { IUserDao } from './user.dao';)"
perl -0pi -e 's|^(import \{ UserRepository \} from \x27./user.repository\x27;\n)|$1import { $ENV{NAME}Repository } from \x27./$ENV{KEBAB}.repository\x27;\n|m' "$APP/repository/repository.tokens.ts"
grep -qF "${NAME}Repository } from './${KEBAB}.repository'" "$APP/repository/repository.tokens.ts" || die "could not add the import to repository.tokens.ts"
printf "\nexport const %s_REPOSITORY_TOKEN = new InjectionToken<%sRepository>('%sRepository');\n" "$UPPER" "$NAME" "$NAME" >> "$APP/repository/repository.tokens.ts"
perl -0pi -e 's|(export \* from \x27./repository.tokens\x27;\n)|export * from \x27./$ENV{KEBAB}.repository\x27;\n$1|' "$APP/repository/index.ts"
perl -0pi -e 's|(import \{ UserRepositoryImpl \} from \x27./repository/impl/user.repository.impl\x27;\n)|$1import { $ENV{UPPER}_DAO_TOKEN } from \x27./dao/index\x27;\nimport { $ENV{NAME}DaoImpl } from \x27./dao/impl/$ENV{KEBAB}.dao.impl\x27;\nimport { $ENV{UPPER}_REPOSITORY_TOKEN } from \x27./repository/repository.tokens\x27;\nimport { $ENV{NAME}RepositoryImpl } from \x27./repository/impl/$ENV{KEBAB}.repository.impl\x27;\n|' "$APP/app.config.ts"
perl -0pi -e 's|(\n(\s*)\{ provide: USER_REPOSITORY_TOKEN, useClass: UserRepositoryImpl \},)|$1\n$2// $ENV{NAME} (tools/new-feature.sh)\n$2\{ provide: $ENV{UPPER}_DAO_TOKEN, useClass: $ENV{NAME}DaoImpl \},\n$2\{ provide: $ENV{UPPER}_REPOSITORY_TOKEN, useClass: $ENV{NAME}RepositoryImpl \},|' "$APP/app.config.ts"
grep -qF "useClass: ${NAME}RepositoryImpl" "$APP/app.config.ts" || die "could not add providers to app.config.ts"
perl -0pi -e 's|(\n(\s*)\{\n\s*path: \x27\*\*\x27,)|\n$2\{\n$2  path: \x27$ENV{PLURAL}\x27,\n$2  loadChildren: () =>\n$2    import(\x27./presentation/features/$ENV{PLURAL}/$ENV{PLURAL}.routes\x27).then(\n$2      m => m.$ENV{UPPER}S_ROUTES\n$2    ),\n$2\},$1|' "$APP/app.routes.ts"
grep -qF "${UPPER}S_ROUTES" "$APP/app.routes.ts" || die "could not add the route to app.routes.ts"

echo "new-feature: ${NAME} slice created (route /${PLURAL}). Next: npx ng build && tools/arch-check.sh && tests (AGENTS.md §5)"

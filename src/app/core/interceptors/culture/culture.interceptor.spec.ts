import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { cultureInterceptor } from './culture.interceptor';
import { I18nService } from '../../../shared/services/i18n/i18n.service';
import { of } from 'rxjs';

describe('CultureInterceptor', () => {
  let interceptor: typeof cultureInterceptor;
  let mockI18nService: jasmine.SpyObj<I18nService>;
  let mockHandler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    mockI18nService = jasmine.createSpyObj('I18nService', [], {
      currentLanguage: () => 'en',
    });

    mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
    mockHandler.handle.and.returnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        { provide: I18nService, useValue: mockI18nService },
      ],
    });

    interceptor = cultureInterceptor;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Accept-Language header with current language', () => {
    const request = new HttpRequest('GET', '/api/test');
    
    interceptor(request, (req) => {
      expect(req.headers.get('Accept-Language')).toBe('en-US');
      return mockHandler.handle(req);
    }).subscribe();
  });
});


import {
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { DOCUMENT, NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { ROUTES } from './sidebar-items';
import { AuthService } from '@core';
import { RouteInfo } from './sidebar.metadata';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgScrollbar } from 'ngx-scrollbar';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    NgScrollbar,
    MatButtonModule,
    RouterLink,
    MatTooltipModule,
    RouterLinkActive,
    NgClass,
  ],
})
export class SidebarComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit, OnDestroy
{
  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  listMaxWidth?: string;
  userFullName?: string;
  userImg?: string;
  userType?: string;
  headerHeight = 60;
  currentRoute?: string;

  userLogged: string | undefined = '';
  
  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    private readonly _renderer: Renderer2,
    public readonly _elementRef: ElementRef,
    private readonly _authService: AuthService,
    private readonly _router: Router,
    private readonly _domSanitizer: DomSanitizer
  ) {
    super();
    this.subs.sink = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // close sidebar on mobile screen after menu select
        this._renderer.removeClass(this._document.body, 'overlay-open');
      }
    });
    const roleInfo = this._authService.getRoleInfoByToken();
    this.userLogged = roleInfo ? roleInfo.roleName : undefined;
  }
  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this._renderer.removeClass(this._document.body, 'overlay-open');
    }
  }

  callToggleMenu(event: Event, length: number): void {
    if (!this.isValidLength(length) || !this.isValidEvent(event)) {
      return;
    }

    const parentElement = (event.target as HTMLElement).closest('li');
    if (!parentElement) {
      return;
    }

    const activeClass = parentElement.classList.contains('active');

    if (activeClass) {
      this._renderer.removeClass(parentElement, 'active');
    } else {
      this._renderer.addClass(parentElement, 'active');
    }
  }

  private isValidLength(length: number): boolean {
    return length > 0;
  }

  private isValidEvent(event: Event): boolean {
    return event && event.target instanceof HTMLElement;
  }

  sanitizeHtml(html: string): SafeHtml {
    return this._domSanitizer.bypassSecurityTrustHtml(html);
  }

  ngOnInit() {
    const rolAuthority = this._authService.getAuthFromSessionStorage().rol_id;
    this.sidebarItems = ROUTES.filter((sidebarItem) => sidebarItem?.rolAuthority.includes(rolAuthority));
    this.initLeftSidebar();
    this.bodyTag = this._document.body;
  }


  initLeftSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }
  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }
  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this._renderer.addClass(this._document.body, 'ls-closed');
    } else {
      this._renderer.removeClass(this._document.body, 'ls-closed');
    }
  }
  mouseHover() {
    const body = this._elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this._renderer.addClass(this._document.body, 'side-closed-hover');
      this._renderer.removeClass(this._document.body, 'submenu-closed');
    }
  }
  mouseOut() {
    const body = this._elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this._renderer.removeClass(this._document.body, 'side-closed-hover');
      this._renderer.addClass(this._document.body, 'submenu-closed');
    }
  }
}

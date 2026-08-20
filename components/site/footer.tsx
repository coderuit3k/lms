export function SiteFooter() {
  return (
    <footer className="bg-surface-container-highest w-full mt-auto">
      <div className="w-full py-stack-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-display text-headline-md text-on-surface">Scholaris</span>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            © 2024 Scholaris Academy. Trao quyền tri thức toàn cầu.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 font-label-sm text-label-sm">
          <a className="text-on-surface-variant hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity" href="#">
            Chính sách bảo mật
          </a>
          <a className="text-on-surface-variant hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity" href="#">
            Điều khoản dịch vụ
          </a>
          <a className="text-on-surface-variant hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity" href="#">
            Hỗ trợ
          </a>
          <a className="text-on-surface-variant hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity" href="#">
            Đối tác liên kết
          </a>
        </nav>
      </div>
    </footer>
  );
}

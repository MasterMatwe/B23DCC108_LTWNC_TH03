import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Link className="footer-brand" href="/">
            PTIT <span>/</span> LIBRARY
          </Link>
          <p>Thư viện khoa Công nghệ thông tin</p>
        </div>
        <p>Học viện Công nghệ Bưu chính Viễn thông</p>
        <span className="footer-year">© 2026</span>
      </div>
    </footer>
  );
}

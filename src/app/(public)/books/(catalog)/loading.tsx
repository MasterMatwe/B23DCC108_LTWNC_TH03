export default function LoadingBooks() {
  return (
    <div className="container loading-page" role="status" aria-live="polite">
      <p className="eyebrow">THƯ VIỆN KHOA CNTT</p>
      <h1>Đang tải danh mục sách...</h1>
      <p>Đang tìm những trang sách dành cho bạn.</p>
      <div className="loading-lines" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    </div>
  );
}

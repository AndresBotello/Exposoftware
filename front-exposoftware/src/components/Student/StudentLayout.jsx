export default function StudentLayout({ children }) {
  return (<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="grid grid-cols-1 lg:grid-cols-4 gap-6">{children}</div></div>);
}

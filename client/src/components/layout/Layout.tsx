import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Sidebar */}
      <Sidebar />
    
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto transition-all duration-300">
        <div className="container mx-auto p-8 max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );
}

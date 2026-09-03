export type PageId = "overview" | "activity" | "servers" | "settings";

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "activity", label: "Atividade" },
  { id: "servers", label: "Servidores" },
  { id: "settings", label: "Configurações" },
];

interface SidebarProps {
  active: PageId;
  onSelect: (page: PageId) => void;
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">The Center</div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`sidebar-item${active === item.id ? " active" : ""}`}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

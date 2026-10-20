import {
  Activity, AlertCircle, ArrowDownLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check, Download, Pencil, Plus, Trash2, X,
  Building2, CalendarDays, CircleCheck, CircleUserRound, FileText, House,
  Inbox, Landmark, LoaderCircle, Megaphone, Search, Settings2, ShieldCheck, UsersRound,
  Wallet, type LucideIcon, Menu,
  LogOut,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  dashboard: Activity,
  group: UsersRound,
  home: House,
  account_balance_wallet: Wallet,
  description: FileText,
  campaign: Megaphone,
  admin_panel_settings: Settings2,
  location_city: Building2,
  assured_workload: Landmark,
  person: CircleUserRound,
  error: AlertCircle,
  task_alt: CircleCheck,
  loading: LoaderCircle,
  search: Search,
  calendar_today: CalendarDays,
  verified: BadgeCheck,
  security: ShieldCheck,
  masuk: ArrowDownLeft,
  keluar: ArrowUpRight,
  arrow: ArrowRight,
  plus: Plus,
  close: X,
  check: Check,
  inbox: Inbox,
  download: Download,
  edit: Pencil,
  delete: Trash2,
  logout: LogOut,
  menu: Menu,

};

export function UiIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const Icon = iconMap[name] ?? Activity;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} className={className} />;
}

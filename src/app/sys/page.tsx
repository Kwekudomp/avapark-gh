import SysControl from "./SysControl";

export const metadata = {
  title: "System",
  robots: { index: false, follow: false },
};

export default function SysPage() {
  return <SysControl />;
}

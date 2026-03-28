import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  readonly name: string;
  readonly image?: string | null;
  readonly className?: string;
}

const GOOGLE_COLORS = [
  { bg: "#E8F0FE", text: "#1967D2" }, 
  { bg: "#E6F4EA", text: "#137333" }, 
  { bg: "#FEF7E0", text: "#B06000" }, 
  { bg: "#FCE8E6", text: "#C5221F" }, 
  { bg: "#F3E8FD", text: "#8430CE" }, 
  { bg: "#E4F7FB", text: "#007B83" }, 
  { bg: "#FCF0E4", text: "#AF5B00" }, 
];

const getSeededColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GOOGLE_COLORS.length;
  return GOOGLE_COLORS[index];
};

const getInitials = (name: string) => {
  if (!name) return "??";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const initials = getInitials(name);
  const colorPair = getSeededColor(name);

  return (
    <Avatar className={cn("h-10 w-10 shrink-0 border-none", className)}>
      <AvatarImage src={image ?? undefined} alt={name} className="object-cover" />
      <AvatarFallback
        style={{ 
            backgroundColor: colorPair.bg, 
            color: colorPair.text 
        }}
        className="text-[14px] font-medium tracking-tight"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
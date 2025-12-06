import { Button } from "./ui/button";
import { Home } from "lucide-react";

interface BackToHomeProps {
  className?: string;
}

export function BackToHome({ className }: BackToHomeProps) {
  const handleClick = () => {
    window.location.href = "/";
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={className}
    >
      <Home className="w-4 h-4 mr-2" />
      返回首页 / Back to Home
    </Button>
  );
}

interface InfoTextProps {
  textOpacity: number;
  scrollProgress: number;
}

export function InfoText({ textOpacity, scrollProgress }: InfoTextProps) {
  return (
    <div className="w-full max-w-4xl">
      <div 
        className="text-sm text-muted-foreground text-center transition-opacity duration-500 will-change-opacity"
        style={{ opacity: textOpacity }}
      >
        <p>
          Share the latest design and artificial intelligence consulting <span className="font-medium text-foreground">「 weekly news 」</span><br />Updated once a Monday morning
        </p>
      </div>
    </div>
  );
} 
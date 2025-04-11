export function BlurMasks() {
  return (
    <>
      <div className="blur-mask-top" style={{ zIndex: 60 }}></div>
      <div className="blur-mask-bottom" style={{ zIndex: 60 }}></div>
      <div className="blur-mask-left" style={{ zIndex: 60 }}></div>
      <div className="blur-mask-right" style={{ zIndex: 60 }}></div>
    </>
  );
} 
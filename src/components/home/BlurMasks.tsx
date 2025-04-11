export function BlurMasks() {
  return (
    <>
      <div className="blur-mask-top pointer-events-none" style={{ zIndex: 30 }}></div>
      <div className="blur-mask-bottom pointer-events-none" style={{ zIndex: 30 }}></div>
      <div className="blur-mask-left pointer-events-none" style={{ zIndex: 30 }}></div>
      <div className="blur-mask-right pointer-events-none" style={{ zIndex: 30 }}></div>
    </>
  );
} 
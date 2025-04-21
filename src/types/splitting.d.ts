declare module 'splitting' {
  interface SplittingOptions {
    /* Splitting options, e.g., target, by, key */
    target?: string | Node | NodeList | Element[];
    by?: string;
    key?: string;
  }

  interface SplittingResult {
    el: Element;
    words: Element[];
    chars: Element[];
    // Add other potential results like lines, items etc. if needed
  }

  function Splitting(options?: SplittingOptions): SplittingResult[];
  export default Splitting;
} 
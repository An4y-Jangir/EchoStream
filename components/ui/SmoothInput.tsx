// "use client";
// 
// import { motion, useReducedMotion } from "framer-motion";
// import React, {
//   useEffect,
//   useRef,
//   useState,
//   forwardRef,
//   useImperativeHandle,
//   type ComponentPropsWithRef
// } from "react";
// import { cn } from "@/lib/utils";
// 
// interface SmoothInputProps extends Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue"> {
//   wrapperClassName?: string;
//   icon?: React.ReactNode;
//   value?: string;
//   defaultValue?: string;
// }
// 
// // SmoothInput component is currently commented out to use AnimatedInput instead, as requested.
// // Below is the original implementation preserved for history:
// 
// export const SmoothInput = forwardRef<HTMLInputElement, SmoothInputProps>(
//   ({ className, wrapperClassName, icon, value, defaultValue, onChange, onKeyDown, ...props }, ref) => {
//     const [internalValue, setInternalValue] = useState(defaultValue ?? "");
//     const [caretX, setCaretX] = useState(0);
//     const [caretOpacity, setCaretOpacity] = useState(0);
//     const [isFocused, setIsFocused] = useState(false);
// 
//     const containerRef = useRef<HTMLDivElement>(null);
//     const inputRef = useRef<HTMLInputElement>(null);
//     const caretRef = useRef<HTMLDivElement>(null);
//     const canvasRef = useRef<HTMLCanvasElement | null>(null);
//     const prefersReducedMotion = useReducedMotion();
// 
//     const isControlled = value !== undefined;
//     const inputValue = isControlled ? String(value) : internalValue;
// 
//     useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
// 
//     useEffect(() => {
//       if (!canvasRef.current) {
//         const canvas = document.createElement("canvas");
//         canvas.style.display = "none";
//         document.body.appendChild(canvas);
//         canvasRef.current = canvas;
//       }
// 
//       const input = inputRef.current;
//       const caret = caretRef.current;
//       const container = containerRef.current;
// 
//       if (!input || !caret || !container) return;
// 
//       const measureCaretPosition = () => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;
//         const context = canvas.getContext("2d");
//         if (!context) return;
// 
//         const style = window.getComputedStyle(input);
//         context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
// 
//         const textBeforeCursor = inputValue.slice(0, input.selectionStart ?? 0);
//         const textWidth = context.measureText(textBeforeCursor).width;
//         
//         // Padding left (e.g., pl-11 is 44px)
//         const paddingLeft = parseFloat(style.paddingLeft) || 0;
//         setCaretX(paddingLeft + textWidth);
//       };
// 
//       const handleFocus = () => {
//         setIsFocused(true);
//         setCaretOpacity(1);
//         measureCaretPosition();
//       };
// 
//       const handleBlur = () => {
//         setIsFocused(false);
//         setCaretOpacity(0);
//       };
// 
//       const handleInput = () => {
//         measureCaretPosition();
//       };
// 
//       const handleSelectionChange = () => {
//         if (document.activeElement === input) {
//           measureCaretPosition();
//         }
//       };
// 
//       input.addEventListener("focus", handleFocus);
//       input.addEventListener("blur", handleBlur);
//       input.addEventListener("input", handleInput);
//       document.addEventListener("selectionchange", handleSelectionChange);
// 
//       // Run initial measurement if focused
//       if (document.activeElement === input) {
//         setIsFocused(true);
//         setCaretOpacity(1);
//         measureCaretPosition();
//       }
// 
//       return () => {
//         input.removeEventListener("focus", handleFocus);
//         input.removeEventListener("blur", handleBlur);
//         input.removeEventListener("input", handleInput);
//         document.removeEventListener("selectionchange", handleSelectionChange);
//       };
//     }, [inputValue]);
// 
//     const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       if (!isControlled) {
//         setInternalValue(e.target.value);
//       }
//       if (onChange) {
//         onChange(e);
//       }
//     };
// 
//     return (
//       <div
//         ref={containerRef}
//         className={cn("relative flex items-center w-full", wrapperClassName)}
//       >
//         {icon && (
//           <div className="absolute left-4 pointer-events-none z-10 flex items-center text-slate-400">
//             {icon}
//           </div>
//         )}
//         <input
//           ref={inputRef}
//           className={cn(
//             "caret-transparent", // Hide default caret
//             className
//           )}
//           value={inputValue}
//           onChange={handleTextChange}
//           onKeyDown={onKeyDown}
//           {...props}
//         />
//         {!prefersReducedMotion && (
//           <motion.div
//             ref={caretRef}
//             className="absolute w-[1.5px] h-[14px] bg-accent pointer-events-none rounded-full"
//             initial={{ opacity: 0 }}
//             animate={{
//               x: caretX,
//               opacity: caretOpacity,
//             }}
//             transition={{
//               type: "spring",
//               stiffness: 280,
//               damping: 26,
//               opacity: { duration: 0.1 }
//             }}
//           />
//         )}
//       </div>
//     );
//   }
// );
// 
// SmoothInput.displayName = "SmoothInput";

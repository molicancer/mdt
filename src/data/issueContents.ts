import { IssueContent } from "@/types/issue";

// 期数内容数据（静态数据，之后会从API获取）
export const issueContents: IssueContent[] = [
  {
    id: 1,
    number: 54,
    color: "#FF9E80", // 橙红色
    title: "AI Grok3",
    subtitle: "Onlook",
    items: ["Copy web Design", "Micrsoft muse", "UX design for Gork", "Copy web Design", "Micrsoft muse", "UX design for Gork"],
    author: "Nitish khagwal",
    icon: "/test.png", // 直接使用图片路径
    date: "2023-11-01"
  },
  {
    id: 2,
    number: 53,
    color: "#90CAF9", // 蓝色
    title: "New ios19",
    subtitle: "Gpt 4o",
    items: ["Flora AI", "Claude 3.7", "通义万象Wan", "Runway"],
    author: "Tim Cook",
    icon: "/test.png", // 直接使用图片路径
    date: "2023-10-15"
  },
  {
    id: 3,
    number: 52,
    color: "#81C784", // 绿色
    title: "Android 15",
    subtitle: "Material You",
    items: ["Google I/O", "Design patterns", "Modern Android"],
    author: "Sundar Pichai",
    icon: "/test.png", // 直接使用图片路径
    date: "2023-10-01"
  }
]; 
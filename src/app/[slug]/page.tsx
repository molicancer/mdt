import { redirect } from 'next/navigation';

// 在服务器组件中重新实现提取期数的函数
function extractNumberFromSlug(slug: string): number {
  // 从"vol54"格式中提取"54"
  const match = slug.match(/vol(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0; // 默认值
}

// 定义页面参数类型
interface IssuePageProps {
  params: {
    slug: string;
  };
}

// 动态获取页面元数据
export async function generateMetadata({ params }: IssuePageProps) {
  const { slug } = params;
  
  // 检查是否匹配期数格式
  const issueNumber = extractNumberFromSlug(slug);
  
  return {
    title: issueNumber > 0 ? `Vol ${issueNumber} - MDT Weekly` : 'MDT - Design & Inspiration',
    description: `MDT Weekly Vol ${issueNumber} - Design & Inspiration`,
  };
}

// 处理动态路由的页面组件
export default function IssuePage({ params }: IssuePageProps) {
  // 提取slug
  const { slug } = params;

  // 如果是期数格式 (volXX)，重定向到主页并带上期数参数
  if (slug.match(/^vol\d+$/i)) {
    // 提取期数
    const issueNumber = extractNumberFromSlug(slug);
    
    // 重定向到首页，带上期数和阶段标记
    // vol{number} - 表示期数
    // s2 - 表示直接进入第二阶段(stage 2)
    // browse - 表示进入浏览模式(标记3)
    redirect(`/#vol${issueNumber}&s2&browse`);
  }

  // 如果URL不符合期数格式，返回404页面
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4">The page you&apos;re looking for doesn&apos;t exist.</p>
    </div>
  );
} 
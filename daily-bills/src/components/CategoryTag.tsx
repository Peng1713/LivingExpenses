import { Tag } from 'antd';
import {
  CoffeeOutlined,
  CarOutlined,
  ShoppingOutlined,
  SmileOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  ReadOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import { type CategoryType, CATEGORY_MAP } from '../types';

const iconMap: Record<string, React.ReactNode> = {
  CoffeeOutlined: <CoffeeOutlined />,
  CarOutlined: <CarOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  SmileOutlined: <SmileOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  HomeOutlined: <HomeOutlined />,
  MedicineBoxOutlined: <MedicineBoxOutlined />,
  ReadOutlined: <ReadOutlined />,
  EllipsisOutlined: <EllipsisOutlined />,
};

export default function CategoryTag({ category }: { category: CategoryType }) {
  const info = CATEGORY_MAP[category];
  if (!info) return null;
  return (
    <Tag color={info.color} icon={iconMap[info.icon]}>
      {info.label}
    </Tag>
  );
}

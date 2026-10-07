import { MaterialCriteria, ProjectMetadata } from '../types/structure';

export const DEFAULT_CRITERIA: MaterialCriteria = {
  fc_ksc: 240, // Cube 240 ksc or Cylinder 200 ksc
  isCube: true,
  fc_cylinder: 199.2, // 240 * 0.83
  Ec: 212870, // 15,100 * sqrt(199.2) ksc
  fy_main: 4000, // SD40
  fs_main: 1700, // WSD allowable
  fy_stirrup: 2400, // SR24 (RB6/RB9)
  fs_stirrup: 1200, // WSD allowable
  Es: 2040000,
  modular_ratio: 9.58, // Es / Ec
  cover_slab: 2.0,
  cover_beam: 3.0,
  cover_column: 3.0,
  cover_footing: 7.5,
  ll_residential: 150,
  ll_roof: 50,
  ll_balcony_stair: 300,
  finish_dl: 100,
  wall_dl: 180, // kg/m2 (brick half wall)
  soil_bearing_capacity: 10, // ton/m2
  pile_safe_load: 20, // ton/pile
  pile_size: 260 // mm
};

export const DEFAULT_PROJECT: ProjectMetadata = {
  projectName: "โครงการบ้านพักอาศัย ค.ส.ล. 2 ชั้น",
  projectCode: "RC-RES-2026-01",
  buildingType: "อาคารพักอาศัย ค.ส.ล. 2 ชั้น (Residential RC Building)",
  ownerName: "คุณสมชาย มั่งคั่งและครอบครัว",
  location: "กรุงเทพมหานคร",
  engineerName: "วิศวกรผู้เชี่ยวชาญ",
  licenseNumber: "สย. 998877",
  licenseLevel: "สามัญวิศวกรโยธา (สย.)",
  designDate: new Date().toISOString().split('T')[0],
  developerCredit: "นายปวินท์วัฒน์ สุขขี ผู้พัฒนาโปรแกรม",
  notes: "คำนวณและออกแบบตามพระราชบัญญัติควบคุมอาคาร พ.ศ. 2522, กฎกระทรวงฉบับที่ 6 พ.ศ. 2527 และมาตรฐาน ว.ส.ท. / ACI 318"
};

export const REBAR_DATABASE = [
  { size: 'RB6', diam: 6, area: 0.283, weight: 0.222, type: 'RB' as const },
  { size: 'RB9', diam: 9, area: 0.636, weight: 0.499, type: 'RB' as const },
  { size: 'DB12', diam: 12, area: 1.131, weight: 0.888, type: 'DB' as const },
  { size: 'DB16', diam: 16, area: 2.011, weight: 1.58, type: 'DB' as const },
  { size: 'DB20', diam: 20, area: 3.142, weight: 2.47, type: 'DB' as const },
  { size: 'DB25', diam: 25, area: 4.909, weight: 3.85, type: 'DB' as const },
  { size: 'DB28', diam: 28, area: 6.158, weight: 4.83, type: 'DB' as const },
];

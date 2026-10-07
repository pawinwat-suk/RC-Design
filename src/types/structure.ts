/**
 * Structural Engineering Types for Residential RC Building Design
 * Follows ACI 318-19, EIT 1007-34 (วสท.), and Thai Ministerial Regulations (กฎกระทรวง)
 */

export type DesignMethod = 'USD' | 'WSD'; // Ultimate Strength Design vs Working Stress Design

export interface MaterialCriteria {
  // Concrete
  fc_ksc: number; // Concrete compressive strength (Cylinder ksc or Cube converted)
  isCube: boolean; // If entered as Cube (e.g. 210, 240 ksc), cylinder = 0.83 * cube
  fc_cylinder: number; // Effective Cylinder f'c (ksc)
  Ec: number; // Concrete Modulus of Elasticity (ksc)
  
  // Steel
  fy_main: number; // Main rebar yield strength (e.g. 3000 for SD30, 4000 for SD40) ksc
  fs_main: number; // Allowable stress for WSD (ksc)
  fy_stirrup: number; // Stirrup rebar yield strength (e.g. 2400 for SR24, 3000 for SD30) ksc
  fs_stirrup: number; // Stirrup allowable stress for WSD (ksc)
  Es: number; // Steel Modulus 2,040,000 ksc
  modular_ratio: number; // n = Es / Ec

  // Clear Cover (cm)
  cover_slab: number; // default 2.0 cm
  cover_beam: number; // default 3.0 cm
  cover_column: number; // default 3.0 cm
  cover_footing: number; // default 5.0 - 7.5 cm

  // Standard Load defaults (ตามกฎกระทรวง ฉบับที่ 6 พ.ศ. 2527)
  ll_residential: number; // kg/m2 (default 150)
  ll_roof: number; // kg/m2 (default 30-100)
  ll_balcony_stair: number; // kg/m2 (default 300)
  finish_dl: number; // kg/m2 (default 100 - screed/tile)
  wall_dl: number; // kg/m for 1/2 brick wall = 180 kg/m2 * height

  // Soil & Pile defaults
  soil_bearing_capacity: number; // qa in ton/m2 (default 8 - 15)
  pile_safe_load: number; // Safe capacity per pile (ton)
  pile_size: number; // mm (e.g. 220 for I-22, 260 for I-26, 300 for bored)
}

export interface ProjectMetadata {
  projectName: string;
  projectCode: string;
  buildingType: string;
  ownerName: string;
  location: string;
  engineerName: string;
  licenseNumber: string;
  licenseLevel: 'ภาคีวิศวกรโยธา (ภย.)' | 'สามัญวิศวกรโยธา (สย.)' | 'วุฒิวิศวกรโยธา (วย.)';
  designDate: string;
  developerCredit: string;
  developerPhotoUrl?: string;
  notes: string;
}

export type StructuralCategory = 'slab' | 'beam' | 'stair' | 'column' | 'footing';

export type StructuralType =
  // Slabs
  | 'slab_on_ground'
  | 'slab_two_way'
  | 'slab_one_way'
  | 'slab_precast_plank'
  | 'slab_precast_hollow_core'
  // Beams
  | 'beam_simple'
  | 'beam_continuous'
  | 'beam_cantilever'
  // Stairs
  | 'stair_flat_soffit'
  | 'stair_sawtooth'
  | 'stair_spiral'
  // Columns
  | 'column_rect_short'
  | 'column_rect_slender'
  | 'column_circle_short'
  | 'column_circle_slender'
  // Footings
  | 'footing_isolated_spread'
  | 'footing_combined_spread'
  | 'footing_pile_single'
  | 'footing_pile_two'
  | 'footing_pile_three'
  | 'footing_pile_four';

export interface BaseStructuralItem {
  id: string;
  tag: string; // e.g. S-1, B-1, C-1, F-1
  name: string;
  category: StructuralCategory;
  type: StructuralType;
  description: string;
  method: DesignMethod;
}

export interface RebarSpec {
  diameter: number; // mm (6, 9, 12, 16, 20, 25, 28)
  barType: 'RB' | 'DB';
  count?: number; // For concentrated bars
  spacing?: number; // cm for mesh or stirrups
  areaProvided: number; // cm2
  areaRequired: number; // cm2
  label: string; // e.g. 4-DB16 or DB12 @ 0.15 m
}

export interface DesignStepCheck {
  step: string;
  formula: string;
  calculation: string;
  value: number | string;
  limit: number | string;
  unit: string;
  status: 'PASS' | 'FAIL' | 'INFO';
  ratio?: number; // Demand / Capacity ratio
  note?: string;
}

export interface CalculationResult {
  summary: string;
  isSafe: boolean;
  maxRatio: number; // critical D/C ratio
  checks: DesignStepCheck[];
  appliedLoads: Record<string, number | string>;
  internalForces: {
    maxMoment?: number; // kg-m or ton-m
    minMoment?: number; // kg-m
    maxShear?: number; // kg or ton
    maxAxial?: number; // kg or ton
    maxTorsion?: number; // kg-m
    soilPressure?: number; // ton/m2 or kg/cm2
    pileLoadMax?: number; // ton/pile
  };
  reinforcement: {
    mainFlexure?: RebarSpec;
    secondaryFlexure?: RebarSpec;
    topBars?: RebarSpec;
    bottomBars?: RebarSpec;
    shearStirrups?: RebarSpec;
    tiesOrSpiral?: RebarSpec;
    temperatureBars?: RebarSpec;
    punchingCheckPassed?: boolean;
    beamShearCheckPassed?: boolean;
  };
  deflectionCheck?: {
    estimated: number; // mm
    allowable: number; // mm
    passed: boolean;
  };
  diagramData: {
    shearValues?: { x: number; v: number }[];
    momentValues?: { x: number; m: number }[];
    length: number;
    depth?: number;
    width?: number;
  };
}

export interface StructuralMemberData extends BaseStructuralItem {
  params: Record<string, any>;
  result?: CalculationResult;
}

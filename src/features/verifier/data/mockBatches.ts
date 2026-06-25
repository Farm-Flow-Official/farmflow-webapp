/**
 * Temporary stand-in until verifier endpoints exist.
 * _live and totalCarbonKgCo2e are added by fetchBatches() at runtime.
 */
export const mockBatches = [
  // ── flagged / pending (match V-02 alerts) ──
  { id: 'BATCH-2026-0042', farmId: 'FARM-GIS-10', farmName: 'ไร่หัวใจ', ownerName: 'วิชัย ไร่กาแฟ', submittedAt: '2026-06-08T07:45:00Z', treeCount: 38, avgConfidence: 0.43, anomalyFlag: true, status: 'Pending', totalCarbonKgCo2e: 15600 },
  { id: 'BATCH-2026-0039', farmId: 'FARM-GIS-05', farmName: 'แปลงริมน้ำ', ownerName: 'ดวงใจ ไร่สับปะรด', submittedAt: '2026-06-07T03:20:00Z', treeCount: 21, avgConfidence: 0.61, anomalyFlag: true, status: 'Pending', totalCarbonKgCo2e: 8400 },
  { id: 'BATCH-2026-0035', farmId: 'FARM-GIS-06', farmName: 'ไร่สุขใจ', ownerName: 'ภานุพงศ์ ทุ่งทอง', submittedAt: '2026-06-06T09:10:00Z', treeCount: 44, avgConfidence: 0.58, anomalyFlag: true, status: 'Pending', totalCarbonKgCo2e: 19200 },
  // ── pending / healthy ──
  { id: 'BATCH-2026-0041', farmId: 'FARM-GIS-01', farmName: 'สวนรุ่งเรือง', ownerName: 'สมชาย ใจดี', submittedAt: '2026-06-08T02:30:00Z', treeCount: 29, avgConfidence: 0.88, anomalyFlag: false, status: 'Pending', totalCarbonKgCo2e: 11800 },
  { id: 'BATCH-2026-0040', farmId: 'FARM-GIS-02', farmName: 'นาอุดม', ownerName: 'ธนากร ทุ่งรวง', submittedAt: '2026-06-07T06:05:00Z', treeCount: 52, avgConfidence: 0.91, anomalyFlag: false, status: 'Pending', totalCarbonKgCo2e: 23100 },
  { id: 'BATCH-2026-0038', farmId: 'FARM-GIS-03', farmName: 'ไร่บ้านนา', ownerName: 'เอกพงษ์ ไร่มัน', submittedAt: '2026-06-06T04:50:00Z', treeCount: 33, avgConfidence: 0.84, anomalyFlag: false, status: 'Pending', totalCarbonKgCo2e: 13500 },
  { id: 'BATCH-2026-0037', farmId: 'FARM-GIS-04', farmName: 'สวนทอง', ownerName: 'ชัยวัฒน์ ไร่อ้อย', submittedAt: '2026-06-05T08:15:00Z', treeCount: 40, avgConfidence: 0.79, anomalyFlag: false, status: 'Pending', totalCarbonKgCo2e: 16700 },
  { id: 'BATCH-2026-0036', farmId: 'FARM-1008', farmName: 'แปลงกาแฟดอย', ownerName: 'กนกวรรณ พืชผล', submittedAt: '2026-06-04T03:40:00Z', treeCount: 35, avgConfidence: 0.82, anomalyFlag: false, status: 'Pending', totalCarbonKgCo2e: 14200 },
  // ── approved ──
  { id: 'BATCH-2026-0034', farmId: 'FARM-GIS-08', farmName: 'แปลงทดลอง', ownerName: 'สุรชัย นาข้าว', submittedAt: '2026-06-03T05:25:00Z', treeCount: 26, avgConfidence: 0.93, anomalyFlag: false, status: 'Approved', totalCarbonKgCo2e: 10400 },
  { id: 'BATCH-2026-0033', farmId: 'FARM-GIS-07', farmName: 'นาตากลม', ownerName: 'พิมพ์ชนก เรือนไร่', submittedAt: '2026-06-02T07:00:00Z', treeCount: 31, avgConfidence: 0.90, anomalyFlag: false, status: 'Approved', totalCarbonKgCo2e: 12600 },
  { id: 'BATCH-2026-0030', farmId: 'FARM-GIS-09', farmName: 'แปลงสีเขียว', ownerName: 'วันเพ็ญ สวนเขียว', submittedAt: '2026-05-29T04:10:00Z', treeCount: 47, avgConfidence: 0.87, anomalyFlag: false, status: 'Approved', totalCarbonKgCo2e: 20300 },
  // ── rejected ──
  { id: 'BATCH-2026-0029', farmId: 'FARM-1006', farmName: 'สวนดอกไม้', ownerName: 'มาลี ดอกไม้งาม', submittedAt: '2026-05-27T09:30:00Z', treeCount: 18, avgConfidence: 0.55, anomalyFlag: true, status: 'Rejected', totalCarbonKgCo2e: 6900 },
  { id: 'BATCH-2026-0028', farmId: 'FARM-1003', farmName: 'นาทองคำ', ownerName: 'ประสิทธิ์ นาทอง', submittedAt: '2026-05-25T02:45:00Z', treeCount: 22, avgConfidence: 0.62, anomalyFlag: true, status: 'Rejected', totalCarbonKgCo2e: 8800 },
]

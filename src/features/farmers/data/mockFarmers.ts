/**
 * Temporary stand-in data until the admin farmers API lands. Delete this file
 * once `fetchFarmers()` calls the real endpoint.
 * username and _live are added by fetchFarmers() at runtime.
 */
export const mockFarmers = [
  { id: 'FRM-1001', fullName: 'สมชาย ใจดี', phone: '0812345678', email: 'somchai@example.com', accountStatus: 'Active', farmsCount: 3, registeredAt: '2025-01-12T08:30:00Z' },
  { id: 'FRM-1002', fullName: 'สมหญิง รักไร่', phone: '0823456789', email: 'somying@example.com', accountStatus: 'Active', farmsCount: 1, registeredAt: '2025-01-20T03:15:00Z' },
  { id: 'FRM-1003', fullName: 'ประสิทธิ์ นาทอง', phone: '0834567890', email: null, accountStatus: 'Active', farmsCount: 2, registeredAt: '2025-02-03T09:45:00Z' },
  { id: 'FRM-1004', fullName: 'วันเพ็ญ สวนเขียว', phone: '0845678901', email: 'wanpen@example.com', accountStatus: 'Active', farmsCount: 4, registeredAt: '2025-02-14T06:00:00Z' },
  { id: 'FRM-1005', fullName: 'อนุชา ปลูกป่า', phone: '0856789012', email: 'anucha@example.com', accountStatus: 'Suspended', farmsCount: 1, registeredAt: '2025-02-28T11:20:00Z' },
  { id: 'FRM-1006', fullName: 'มาลี ดอกไม้งาม', phone: '0867890123', email: 'malee@example.com', accountStatus: 'Active', farmsCount: 2, registeredAt: '2025-03-05T02:10:00Z' },
  { id: 'FRM-1007', fullName: 'ธนากร ทุ่งรวง', phone: '0878901234', email: null, accountStatus: 'Active', farmsCount: 5, registeredAt: '2025-03-11T07:35:00Z' },
  { id: 'FRM-1008', fullName: 'กนกวรรณ พืชผล', phone: '0889012345', email: 'kanok@example.com', accountStatus: 'Active', farmsCount: 1, registeredAt: '2025-03-19T04:50:00Z' },
  { id: 'FRM-1009', fullName: 'ชัยวัฒน์ ไร่อ้อย', phone: '0890123456', email: 'chai@example.com', accountStatus: 'Active', farmsCount: 3, registeredAt: '2025-03-27T10:05:00Z' },
  { id: 'FRM-1010', fullName: 'ปราณี เกษตรดี', phone: '0801234567', email: 'pranee@example.com', accountStatus: 'Active', farmsCount: 2, registeredAt: '2025-04-02T05:25:00Z' },
  { id: 'FRM-1011', fullName: 'สุรชัย นาข้าว', phone: '0811112222', email: null, accountStatus: 'Active', farmsCount: 1, registeredAt: '2025-04-09T08:40:00Z' },
  { id: 'FRM-1012', fullName: 'จิราพร สวนยาง', phone: '0822223333', email: 'jira@example.com', accountStatus: 'Suspended', farmsCount: 2, registeredAt: '2025-04-15T12:00:00Z' },
  { id: 'FRM-1013', fullName: 'เอกพงษ์ ไร่มัน', phone: '0833334444', email: 'ekkapong@example.com', accountStatus: 'Active', farmsCount: 4, registeredAt: '2025-04-22T03:55:00Z' },
  { id: 'FRM-1014', fullName: 'นภาพร ป่าชุมชน', phone: '0844445555', email: 'napa@example.com', accountStatus: 'Active', farmsCount: 1, registeredAt: '2025-05-01T06:30:00Z' },
  { id: 'FRM-1015', fullName: 'ภานุพงศ์ ทุ่งทอง', phone: '0855556666', email: null, accountStatus: 'Active', farmsCount: 3, registeredAt: '2025-05-08T09:15:00Z' },
  { id: 'FRM-1016', fullName: 'รัตนา สวนผลไม้', phone: '0866667777', email: 'rattana@example.com', accountStatus: 'Active', farmsCount: 2, registeredAt: '2025-05-16T04:20:00Z' },
  { id: 'FRM-1017', fullName: 'วิชัย ไร่กาแฟ', phone: '0877778888', email: 'wichai@example.com', accountStatus: 'Active', farmsCount: 5, registeredAt: '2025-05-23T07:45:00Z' },
  { id: 'FRM-1018', fullName: 'อรอุมา นาเกลือ', phone: '0888889999', email: 'on-uma@example.com', accountStatus: 'Active', farmsCount: 1, registeredAt: '2025-05-30T11:10:00Z' },
  { id: 'FRM-1019', fullName: 'กิตติ ปลูกผัก', phone: '0899990000', email: null, accountStatus: 'Active', farmsCount: 2, registeredAt: '2025-06-04T02:35:00Z' },
  { id: 'FRM-1020', fullName: 'ดวงใจ ไร่สับปะรด', phone: '0801010101', email: 'duangjai@example.com', accountStatus: 'Active', farmsCount: 3, registeredAt: '2025-06-10T08:00:00Z' },
  { id: 'FRM-1021', fullName: 'ณรงค์ สวนมะม่วง', phone: '0812121212', email: 'narong@example.com', accountStatus: 'Active', farmsCount: 1, registeredAt: '2025-06-18T05:50:00Z' },
  { id: 'FRM-1022', fullName: 'พิมพ์ชนก เรือนไร่', phone: '0823232323', email: 'pimchanok@example.com', accountStatus: 'Active', farmsCount: 4, registeredAt: '2025-06-25T10:30:00Z' },
]

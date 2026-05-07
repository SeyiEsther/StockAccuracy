// Mock data matching the expected API response shape from the SQL comparison view.
// Replace the fetch in useStockData.js with a real API call when the backend is ready.

export const MOCK_LAST_UPDATED = "2026-05-07T06:12:00Z";

export const MOCK_STOCK_DATA = [
  { materialNumber: "200003",  description: "WASHER/N125/8,4",           sLoc: "4002", yesterdayQty: 1200, todayQty: 980,   bun: "EA", mrpController: "A06" },
  { materialNumber: "200145",  description: "BOLT M6x20 HEX HEAD",       sLoc: "4002", yesterdayQty: 500,  todayQty: 500,   bun: "EA", mrpController: "A06" },
  { materialNumber: "200892",  description: "CABLE GLAND PG16",           sLoc: "4003", yesterdayQty: 340,  todayQty: 410,   bun: "EA", mrpController: "B02" },
  { materialNumber: "201034",  description: "DIN RAIL 35MM 2M",           sLoc: "4003", yesterdayQty: 80,   todayQty: 80,    bun: "EA", mrpController: "B02" },
  { materialNumber: "201250",  description: "TERMINAL BLOCK 4MM",         sLoc: "1001", yesterdayQty: 2000, todayQty: 1640,  bun: "EA", mrpController: "C01" },
  { materialNumber: "201489",  description: "CONTACTOR 230V 9A",          sLoc: "1001", yesterdayQty: 45,   todayQty: 45,    bun: "EA", mrpController: "C01" },
  { materialNumber: "201532",  description: "CIRCUIT BREAKER 6A 1P",      sLoc: "1001", yesterdayQty: 120,  todayQty: 98,    bun: "EA", mrpController: "C01" },
  { materialNumber: "201788",  description: "CABLE DUCT 25x25",           sLoc: "3001", yesterdayQty: 60,   todayQty: 74,    bun: "EA", mrpController: "A06" },
  { materialNumber: "202001",  description: "EARTH STUD M6",              sLoc: "4002", yesterdayQty: 300,  todayQty: 300,   bun: "EA", mrpController: "A06" },
  { materialNumber: "202210",  description: "ENCLOSURE RIT AX 600x600",   sLoc: "3001", yesterdayQty: 18,   todayQty: 6,     bun: "EA", mrpController: "D05" },
  { materialNumber: "202345",  description: "PUSH BUTTON GREEN 22MM",     sLoc: "4003", yesterdayQty: 90,   todayQty: 113,   bun: "EA", mrpController: "B02" },
  { materialNumber: "202567",  description: "INDICATOR LAMP RED 230V",    sLoc: "4003", yesterdayQty: 55,   todayQty: 55,    bun: "EA", mrpController: "B02" },
  { materialNumber: "202891",  description: "FUSE 6A CYLINDRICAL",        sLoc: "1001", yesterdayQty: 450,  todayQty: 510,   bun: "EA", mrpController: "C01" },
  { materialNumber: "203112",  description: "PSU 24VDC 10A DIN",          sLoc: "1001", yesterdayQty: 22,   todayQty: 22,    bun: "EA", mrpController: "C01" },
  { materialNumber: "203344",  description: "CABLE H07V-K 1.5MM BLK 100M",sLoc: "3001", yesterdayQty: 14,   todayQty: 14,    bun: "RL", mrpController: "D05" },
  { materialNumber: "203500",  description: "GLAND PLATE 600x200",        sLoc: "3001", yesterdayQty: 30,   todayQty: 0,     bun: "EA", mrpController: "D05" },
  { materialNumber: "203678",  description: "SCREW M4x10 POZI",           sLoc: "4002", yesterdayQty: 5000, todayQty: 4980,  bun: "EA", mrpController: "A06" },
  { materialNumber: "203890",  description: "HEX NUT M4 ZINC",            sLoc: "4002", yesterdayQty: 3000, todayQty: 2980,  bun: "EA", mrpController: "A06" },
  { materialNumber: "204102",  description: "RELAY 24VDC SPCO",           sLoc: "1001", yesterdayQty: 0,    todayQty: 40,    bun: "EA", mrpController: "C01" },
  { materialNumber: "204230",  description: "SOCKET BASE 8-PIN DIN",      sLoc: "1001", yesterdayQty: 0,    todayQty: 38,    bun: "EA", mrpController: "C01" },
  { materialNumber: "204455",  description: "LABEL HOLDER 15MM DIN",      sLoc: "4003", yesterdayQty: 200,  todayQty: 200,   bun: "EA", mrpController: "B02" },
  { materialNumber: "204601",  description: "MOUNTING PLATE GALV 600x600",sLoc: "3001", yesterdayQty: 12,   todayQty: 12,    bun: "EA", mrpController: "D05" },
  { materialNumber: "204780",  description: "SHRINK TUBE 3MM BLACK 100M", sLoc: "4002", yesterdayQty: 8,    todayQty: 8,     bun: "RL", mrpController: "A06" },
  { materialNumber: "204920",  description: "CABLE TIE 100MM NATURAL",    sLoc: "4002", yesterdayQty: 2500, todayQty: 2500,  bun: "EA", mrpController: "A06" },
  { materialNumber: "205100",  description: "WIRING DUCT COVER 25MM",     sLoc: "4003", yesterdayQty: 120,  todayQty: 88,    bun: "EA", mrpController: "B02" },
];

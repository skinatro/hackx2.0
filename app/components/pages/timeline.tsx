import type { PageDefinition } from "./types";

const timelinePage: PageDefinition = {
  layout: [
    {
      row: 1,
      col: 6,
      rowSpan: 2,
      colSpan: 12,
      content: (
        <div className="relative flex h-full w-full items-center justify-center p-2">
          <img
            src="/timeline_images/day1_title.webp"
            alt="Day 1 Title"
            className="h-full w-full object-contain pointer-events-none drop-shadow-md"
            draggable={false}
          />
        </div>
      ),
    },
    {
      row: 3,
      col: 6,
      rowSpan: 8,
      colSpan: 12,
      color: "orange",
      texture: "blockprint",
      content: (
        <div className="group relative flex h-full w-full items-center justify-center p-2 transition-colors duration-300 hover:bg-purple-600">
          <img
            src="/timeline_images/day1schedule.webp"
            alt="Day 1 Schedule"
            className="h-full w-full object-contain pointer-events-none drop-shadow-md"
            draggable={false}
          />
        </div>
      ),
    },
    {
      row: 11,
      col: 6,
      rowSpan: 2,
      colSpan: 12,
      content: (
        <div className="relative flex h-full w-full items-center justify-center p-2">
          <img
            src="/timeline_images/day2_title.webp"
            alt="Day 2 Title"
            className="h-full w-full object-contain pointer-events-none drop-shadow-md"
            draggable={false}
          />
        </div>
      ),
    },
    {
      row: 13,
      col: 6,
      rowSpan: 8,
      colSpan: 12,
      color: "orange",
      texture: "blockprint",
      content: (
        <div className="group relative flex h-full w-full items-center justify-center p-2 transition-colors duration-300 hover:bg-purple-600">
          <img
            src="/timeline_images/day2schedule.webp"
            alt="Day 2 Schedule"
            className="h-full w-full object-contain pointer-events-none drop-shadow-md"
            draggable={false}
          />
        </div>
      ),
    },
  ],
};

export default timelinePage;

import type { PageDefinition } from "./types";

const faqsPage: PageDefinition = {
  layout: [
    {
      row: 3,
      col: 6,
      rowSpan: 3,
      colSpan: 12,
      color: "maroon",
      texture: "jaali",
      content: (
        <div className="text-white select-none text-lg navbar-font">
          Frequently Asked Questions
        </div>
      ),
    },
  ],
};

export default faqsPage;

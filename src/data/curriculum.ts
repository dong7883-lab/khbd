export interface Lesson {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  name: string;
  lessons: Lesson[];
}

export interface Grade {
  id: string;
  name: string;
  chapters: Chapter[];
}

export const curriculum: Grade[] = [
  {
    id: "10",
    name: "Lớp 10",
    chapters: [
      {
        id: "10-1",
        name: "Chương 1: Cấu tạo nguyên tử",
        lessons: [
          { id: "10-1-1", name: "Bài 1: Thành phần của nguyên tử" },
          { id: "10-1-2", name: "Bài 2: Nguyên tố hóa học" },
          { id: "10-1-3", name: "Bài 3: Cấu trúc lớp vỏ electron nguyên tử" },
          { id: "10-1-4", name: "Bài 4: Ôn tập chương 1" },
        ],
      },
      {
        id: "10-2",
        name: "Chương 2: Bảng tuần hoàn các nguyên tố hóa học và định luật tuần hoàn",
        lessons: [
          { id: "10-2-5", name: "Bài 5: Cấu tạo của bảng tuần hoàn các nguyên tố hóa học" },
          { id: "10-2-6", name: "Bài 6: Xu hướng biến đổi một số tính chất của nguyên tử các nguyên tố trong một chu kì và trong một nhóm" },
          { id: "10-2-7", name: "Bài 7: Xu hướng biến đổi thành phần và một số tính chất của hợp chất trong một chu kì" },
          { id: "10-2-8", name: "Bài 8: Định luật tuần hoàn. Ý nghĩa của bảng tuần hoàn các nguyên tố hóa học" },
          { id: "10-2-9", name: "Bài 9: Ôn tập chương 2" },
        ],
      },
      {
        id: "10-3",
        name: "Chương 3: Liên kết hóa học",
        lessons: [
          { id: "10-3-10", name: "Bài 10: Quy tắc octet" },
          { id: "10-3-11", name: "Bài 11: Liên kết ion" },
          { id: "10-3-12", name: "Bài 12: Liên kết cộng hóa trị" },
          { id: "10-3-13", name: "Bài 13: Liên kết hydrogen và tương tác van der Waals" },
          { id: "10-3-14", name: "Bài 14: Ôn tập chương 3" },
        ],
      },
      {
        id: "10-4",
        name: "Chương 4: Phản ứng oxi hóa - khử",
        lessons: [
          { id: "10-4-15", name: "Bài 15: Phản ứng oxi hóa - khử" },
          { id: "10-4-16", name: "Bài 16: Ôn tập chương 4" },
        ],
      },
      {
        id: "10-5",
        name: "Chương 5: Năng lượng hóa học",
        lessons: [
          { id: "10-5-17", name: "Bài 17: Biến thiên enthalpy trong các phản ứng hóa học" },
          { id: "10-5-18", name: "Bài 18: Ôn tập chương 5" },
        ],
      },
      {
        id: "10-6",
        name: "Chương 6: Tốc độ phản ứng",
        lessons: [
          { id: "10-6-19", name: "Bài 19: Tốc độ phản ứng" },
          { id: "10-6-20", name: "Bài 20: Ôn tập chương 6" },
        ],
      },
      {
        id: "10-7",
        name: "Chương 7: Nguyên tố nhóm VIIA - Halogen",
        lessons: [
          { id: "10-7-21", name: "Bài 21: Nhóm halogen" },
          { id: "10-7-22", name: "Bài 22: Hydrogen halide - Muối halide" },
          { id: "10-7-23", name: "Bài 23: Ôn tập chương 7" },
        ],
      },
    ],
  },
  {
    id: "11",
    name: "Lớp 11",
    chapters: [
      {
        id: "11-1",
        name: "Chương 1: Cân bằng hóa học",
        lessons: [
          { id: "11-1-1", name: "Bài 1: Khái niệm về cân bằng hóa học" },
          { id: "11-1-2", name: "Bài 2: Cân bằng trong dung dịch nước" },
          { id: "11-1-3", name: "Bài 3: Ôn tập chương 1" },
        ],
      },
      {
        id: "11-2",
        name: "Chương 2: Nitrogen và sulfur",
        lessons: [
          { id: "11-2-4", name: "Bài 4: Nitrogen" },
          { id: "11-2-5", name: "Bài 5: Ammonia. Muối ammonium" },
          { id: "11-2-6", name: "Bài 6: Một số hợp chất của nitrogen với oxygen" },
          { id: "11-2-7", name: "Bài 7: Sulfur và sulfur dioxide" },
          { id: "11-2-8", name: "Bài 8: Sulfuric acid và muối sulfate" },
          { id: "11-2-9", name: "Bài 9: Ôn tập chương 2" },
        ],
      },
      {
        id: "11-3",
        name: "Chương 3: Đại cương về hóa học hữu cơ",
        lessons: [
          { id: "11-3-10", name: "Bài 10: Hợp chất hữu cơ và hóa học hữu cơ" },
          { id: "11-3-11", name: "Bài 11: Phương pháp tách biệt và tinh chế hợp chất hữu cơ" },
          { id: "11-3-12", name: "Bài 12: Công thức phân tử hợp chất hữu cơ" },
          { id: "11-3-13", name: "Bài 13: Cấu tạo hóa học hợp chất hữu cơ" },
          { id: "11-3-14", name: "Bài 14: Ôn tập chương 3" },
        ],
      },
      {
        id: "11-4",
        name: "Chương 4: Hydrocarbon",
        lessons: [
          { id: "11-4-15", name: "Bài 15: Alkane" },
          { id: "11-4-16", name: "Bài 16: Hydrocarbon không no" },
          { id: "11-4-17", name: "Bài 17: Arene (Hydrocarbon thơm)" },
          { id: "11-4-18", name: "Bài 18: Ôn tập chương 4" },
        ],
      },
      {
        id: "11-5",
        name: "Chương 5: Dẫn xuất halogen - Alcohol - Phenol",
        lessons: [
          { id: "11-5-19", name: "Bài 19: Dẫn xuất halogen" },
          { id: "11-5-20", name: "Bài 20: Alcohol" },
          { id: "11-5-21", name: "Bài 21: Phenol" },
          { id: "11-5-22", name: "Bài 22: Ôn tập chương 5" },
        ],
      },
      {
        id: "11-6",
        name: "Chương 6: Hợp chất carbonyl (Aldehyde - Ketone) - Carboxylic acid",
        lessons: [
          { id: "11-6-23", name: "Bài 23: Hợp chất carbonyl" },
          { id: "11-6-24", name: "Bài 24: Carboxylic acid" },
          { id: "11-6-25", name: "Bài 25: Ôn tập chương 6" },
        ],
      },
    ],
  },
  {
    id: "12",
    name: "Lớp 12",
    chapters: [
      {
        id: "12-1",
        name: "Chương 1: Ester - Lipid",
        lessons: [
          { id: "12-1-1", name: "Bài 1: Ester - Lipid" },
          { id: "12-1-2", name: "Bài 2: Xà phòng và chất giặt rửa" },
          { id: "12-1-3", name: "Bài 3: Ôn tập chương 1" },
        ],
      },
      {
        id: "12-2",
        name: "Chương 2: Carbohydrate",
        lessons: [
          { id: "12-2-4", name: "Bài 4: Giới thiệu về carbohydrate" },
          { id: "12-2-5", name: "Bài 5: Glucose và fructose" },
          { id: "12-2-6", name: "Bài 6: Saccharose và maltose" },
          { id: "12-2-7", name: "Bài 7: Tinh bột và cellulose" },
          { id: "12-2-8", name: "Bài 8: Ôn tập chương 2" },
        ],
      },
      {
        id: "12-3",
        name: "Chương 3: Amine - Amino acid - Peptide - Protein",
        lessons: [
          { id: "12-3-9", name: "Bài 9: Amine" },
          { id: "12-3-10", name: "Bài 10: Amino acid" },
          { id: "12-3-11", name: "Bài 11: Peptide và protein" },
          { id: "12-3-12", name: "Bài 12: Ôn tập chương 3" },
        ],
      },
      {
        id: "12-4",
        name: "Chương 4: Polymer",
        lessons: [
          { id: "12-4-13", name: "Bài 13: Đại cương về polymer" },
          { id: "12-4-14", name: "Bài 14: Vật liệu polymer" },
          { id: "12-4-15", name: "Bài 15: Ôn tập chương 4" },
        ],
      },
      {
        id: "12-5",
        name: "Chương 5: Pin điện và điện phân",
        lessons: [
          { id: "12-5-16", name: "Bài 16: Thế điện cực và nguồn điện hóa học" },
          { id: "12-5-17", name: "Bài 17: Điện phân" },
          { id: "12-5-18", name: "Bài 18: Ôn tập chương 5" },
        ],
      },
      {
        id: "12-6",
        name: "Chương 6: Đại cương về kim loại",
        lessons: [
          { id: "12-6-19", name: "Bài 19: Đại cương về kim loại" },
          { id: "12-6-20", name: "Bài 20: Sự ăn mòn kim loại" },
          { id: "12-6-21", name: "Bài 21: Hợp kim" },
          { id: "12-6-22", name: "Bài 22: Ôn tập chương 6" },
        ],
      },
      {
        id: "12-7",
        name: "Chương 7: Nguyên tố nhóm IA và nhóm IIA",
        lessons: [
          { id: "12-7-23", name: "Bài 23: Nguyên tố nhóm IA" },
          { id: "12-7-24", name: "Bài 24: Nguyên tố nhóm IIA" },
          { id: "12-7-25", name: "Bài 25: Ôn tập chương 7" },
        ],
      },
      {
        id: "12-8",
        name: "Chương 8: Sơ lược về kim loại chuyển tiếp dãy thứ nhất và phức chất",
        lessons: [
          { id: "12-8-26", name: "Bài 26: Sơ lược về kim loại chuyển tiếp dãy thứ nhất" },
          { id: "12-8-27", name: "Bài 27: Phức chất" },
          { id: "12-8-28", name: "Bài 28: Ôn tập chương 8" },
        ],
      },
    ],
  },
];

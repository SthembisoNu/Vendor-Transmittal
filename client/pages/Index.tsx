import { useState, useRef } from "react";
import * as XLSX from "xlsx";

interface DocumentRow {
  seq: string;
  rev: string;
  docNo: string;
  sequenceNumber: string;
  revCategory: string;
  docNumber: string;
  copies: string;
  type: string;
  ec: string;
  es: string;
  d: string;
  vendorDate: string;
  dateReceived: string;
}

interface AttentionEntry {
  id: string;
  name: string;
  action: string;
  days: string;
  confirmationDate: string;
}

interface MargentInfo {
  companyName: string;
  address1: string;
  address2: string;
  country: string;
  printCode: string;
}

export default function Index() {
  const [transmittalNo, setTransmittalNo] = useState("VR60");
  const [date, setDate] = useState("22 FEB 2005");
  const [projectNo, setProjectNo] = useState("04121A");
  const [client, setClient] = useState("Release (Petroleum Training (PTU))");
  const [from, setFrom] = useState("Document Control (JHH) D Hexman");
  const [packageNo, setPackageNo] = useState("04175C-17692");
  const [expeditor, setExpeditor] = useState("Ray Hatcherry");
  const [awardDate, setAwardDate] = useState("26012005");
  const [notes, setNotes] = useState("QUAC ABU SD & DR LOADED");
  const [deliveryMethod, setDeliveryMethod] = useState("DY HAND");
  const [contact, setContact] = useState("");
  const [showAttentionModal, setShowAttentionModal] = useState(false);
  const [showMargentModal, setShowMargentModal] = useState(false);
  const [attentionEntries, setAttentionEntries] = useState<AttentionEntry[]>([
    {
      id: "1",
      name: "DOCUMENT CONTROL (JHH) D HEXMAN",
      action: "F1",
      days: "6",
      confirmationDate: "",
    },
    {
      id: "2",
      name: "JOHN BISHOP",
      action: "F1",
      days: "6",
      confirmationDate: "",
    },
    {
      id: "3",
      name: "FLIP HELBERG",
      action: "F1",
      days: "6",
      confirmationDate: "",
    },
  ]);
  const [margentInfo, setMargentInfo] = useState<MargentInfo>({
    companyName: "Margent",
    address1: "21 Monte Carlo Crescent, Kylami Business Park",
    address2: "Kylami",
    country: "South Africa",
    printCode: "0000",
  });
  const [editingEntry, setEditingEntry] = useState<AttentionEntry | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(
    null,
  );

  // Function to generate transmittal data
  const generateTransmittalData = () => {
    return {
      transmittalNo,
      sequenceNumber,
      date,
      projectNo,
      client,
      from,
      packageNo,
      expeditor,
      awardDate,
      deliveryMethod,
      contact,
      notes,
      documents,
      attentionEntries,
      margentInfo,
      generatedAt: new Date().toISOString(),
    };
  };

  // Function to create general transmittal
  const createGeneralTransmittal = () => {
    const transmittalData = generateTransmittalData();

    // Create CSV content for general transmittal
    let csvContent = "Vendor Transmittal - General\n\n";
    csvContent += `Transmittal No:,${transmittalNo},${sequenceNumber}\n`;
    csvContent += `Date:,${date}\n`;
    csvContent += `Project No:,${projectNo}\n`;
    csvContent += `Client:,${client}\n`;
    csvContent += `From:,${from}\n`;
    csvContent += `Package No:,${packageNo}\n`;
    csvContent += `Expeditor:,${expeditor}\n`;
    csvContent += `Award Date:,${awardDate}\n`;
    csvContent += `Delivery Method:,${deliveryMethod}\n`;
    csvContent += `Contact:,${contact}\n`;
    csvContent += `Notes:,"${notes.replace(/"/g, '""')}"\n\n`;

    // Add document table
    csvContent += "Documents:\n";
    csvContent +=
      "Seq,Rev,Doc No,Sequence Number,Rev Category,Doc Number,Copies,Copy Type,E,ES,D,Vendor Date,Date Received\n";
    documents.forEach((doc) => {
      csvContent += `${doc.seq},${doc.rev},${doc.docNo},"${doc.sequenceNumber.replace(/"/g, '""')}",${doc.revCategory},${doc.docNumber},${doc.copies},${doc.type},${doc.ec},${doc.es},${doc.d},${doc.vendorDate},${doc.dateReceived}\n`;
    });

    // Add attention entries
    csvContent += "\nAttention Entries:\n";
    csvContent += "Name,Action,Days,Confirmation Date\n";
    attentionEntries.forEach((entry) => {
      csvContent += `"${entry.name.replace(/"/g, '""')}",${entry.action},${entry.days},${entry.confirmationDate}\n`;
    });

    // Download the file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `general_transmittal_${transmittalNo}_${sequenceNumber}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowSuccessMessage(
      "General transmittal created and downloaded successfully!",
    );
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  // Function to create review transmittal
  const createReviewTransmittal = () => {
    const transmittalData = generateTransmittalData();

    // Create review-specific CSV content
    let csvContent = "Vendor Transmittal - Review Copy\n\n";
    csvContent += `Transmittal No:,${transmittalNo},${sequenceNumber}\n`;
    csvContent += `Date:,${date}\n`;
    csvContent += `Project:,${projectNo} - AFELASE ODUABI PROJECT\n`;
    csvContent += `Client:,${client}\n`;
    csvContent += `Package:,${packageNo}\n\n`;

    csvContent += "REVIEW STATUS:\n";
    csvContent += "Document,Status,Reviewer,Review Date,Comments\n";
    documents.forEach((doc) => {
      csvContent += `"${doc.sequenceNumber.replace(/"/g, '""')}",Pending Review,TBD,TBD,\n`;
    });

    csvContent += "\nATTENTION FOR REVIEW:\n";
    csvContent += "Reviewer,Action Required,Days Allocated,Target Date\n";
    attentionEntries.forEach((entry) => {
      const targetDate = entry.days
        ? new Date(Date.now() + parseInt(entry.days) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        : "TBD";
      csvContent += `"${entry.name.replace(/"/g, '""')}",${entry.action},${entry.days},${targetDate}\n`;
    });

    csvContent += "\nREVIEW INSTRUCTIONS:\n";
    csvContent += "1. Please review all documents listed above\n";
    csvContent += "2. Provide comments and approval status\n";
    csvContent += "3. Return completed review within allocated timeframe\n";
    csvContent += `4. Contact: ${contact || "N/A"}\n`;

    // Download the file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `review_transmittal_${transmittalNo}_${sequenceNumber}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowSuccessMessage(
      "Review transmittal created and downloaded successfully!",
    );
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  // Function to print transmittal
  const printTransmittal = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the transmittal");
      return;
    }

    const transmittalData = generateTransmittalData();

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vendor Transmittal - ${transmittalNo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border: 2px solid #666; background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
          .section { margin: 15px 0; }
          .label { font-weight: bold; display: inline-block; width: 150px; }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; }
          th, td { border: 1px solid #666; padding: 5px; text-align: left; font-size: 12px; }
          th { background: #e0e0e0; font-weight: bold; }
          .company-info { float: right; border: 1px solid #666; padding: 10px; background: #f5f5f5; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Vendor Transmittal</h2>
        </div>

        <div class="company-info">
          <strong>${margentInfo.companyName}</strong><br>
          ${margentInfo.address1}<br>
          ${margentInfo.address2}<br>
          ${margentInfo.country}
        </div>

        <div class="section">
          <span class="label">Transmittal No:</span> ${transmittalNo} ${sequenceNumber}<br>
          <span class="label">Date:</span> ${date}<br>
          <span class="label">Project No:</span> ${projectNo}<br>
          <span class="label">Client:</span> ${client}<br>
          <span class="label">From:</span> ${from}<br>
          <span class="label">Package No:</span> ${packageNo}<br>
          <span class="label">Expeditor:</span> ${expeditor}<br>
          <span class="label">Award Date:</span> ${awardDate}<br>
          <span class="label">Delivery Method:</span> ${deliveryMethod}<br>
          <span class="label">Contact:</span> ${contact}<br>
        </div>

        <div class="section">
          <span class="label">Notes:</span><br>
          ${notes}
        </div>

        <h3>Documents</h3>
        <table>
          <thead>
            <tr>
              <th>Seq</th>
              <th>Rev</th>
              <th>Doc No</th>
              <th>Description</th>
              <th>Rev Cat</th>
              <th>Copies</th>
              <th>Type</th>
              <th>Vendor Date</th>
              <th>Date Received</th>
            </tr>
          </thead>
          <tbody>
            ${documents
              .map(
                (doc) => `
              <tr>
                <td>${doc.seq}</td>
                <td>${doc.rev}</td>
                <td>${doc.docNo}</td>
                <td>${doc.sequenceNumber}</td>
                <td>${doc.revCategory}</td>
                <td>${doc.copies}</td>
                <td>${doc.type}</td>
                <td>${doc.vendorDate}</td>
                <td>${doc.dateReceived}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <h3>Attention</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Action</th>
              <th>Days</th>
              <th>Confirmation Date</th>
            </tr>
          </thead>
          <tbody>
            ${attentionEntries
              .map(
                (entry) => `
              <tr>
                <td>${entry.name}</td>
                <td>${entry.action}</td>
                <td>${entry.days}</td>
                <td>${entry.confirmationDate}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          Generated on: ${new Date().toLocaleString()}<br>
          Print Code: ${margentInfo.printCode}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Function to cancel/reset form
  const cancelForm = () => {
    if (
      confirm(
        "Are you sure you want to cancel and reset the form? All unsaved changes will be lost.",
      )
    ) {
      // Reset to initial values
      setTransmittalNo("VR60");
      setSequenceNumber("363");
      setDate("22 FEB 2005");
      setProjectNo("04121A");
      setClient("Release (Petroleum Training (PTU))");
      setFrom("Document Control (JHH) D Hexman");
      setPackageNo("04175C-17692");
      setExpeditor("Ray Hatcherry");
      setAwardDate("26012005");
      setNotes("QUAC ABU SD & DR LOADED");
      setDeliveryMethod("DY HAND");
      setContact("");

      // Reset documents to initial state
      setDocuments([
        {
          seq: "1",
          rev: "C",
          docNo: "G318V",
          sequenceNumber:
            "G318V DATED 10-02-05 QUALITY PLAN - INSPECTION AND TEST PLAN",
          revCategory: "1",
          docNumber: "C",
          copies: "3",
          type: "C",
          ec: "",
          es: "",
          d: "✓",
          vendorDate: "Planned Date",
          dateReceived: "Status",
        },
        {
          seq: "2",
          rev: "C",
          docNo: "G318V",
          sequenceNumber:
            "G318V DATED 10-02-05 WAUKAU AC CUTTING ANTIFOAM DELIVERY TANK CHARTS CONTROL SCHEME",
          revCategory: "1",
          docNumber: "C",
          copies: "3",
          type: "C",
          ec: "",
          es: "",
          d: "✓",
          vendorDate: "22-FEB-2008",
          dateReceived: "ACK",
        },
        // ... other initial documents
      ]);

      // Reset attention entries
      setAttentionEntries([
        {
          id: "1",
          name: "DOCUMENT CONTROL (JHH) D HEXMAN",
          action: "F1",
          days: "6",
          confirmationDate: "",
        },
        {
          id: "2",
          name: "JOHN BISHOP",
          action: "F1",
          days: "6",
          confirmationDate: "",
        },
        {
          id: "3",
          name: "FLIP HELBERG",
          action: "F1",
          days: "6",
          confirmationDate: "",
        },
      ]);

      // Reset margent info
      setMargentInfo({
        companyName: "Margent",
        address1: "21 Monte Carlo Crescent, Kylami Business Park",
        address2: "Kylami",
        country: "South Africa",
        printCode: "0000",
      });

      setShowSuccessMessage("Form has been reset to default values.");
      setTimeout(() => setShowSuccessMessage(null), 3000);
    }
  };

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        Sequence: "1",
        Rev: "C",
        "Doc No": "G318V",
        "Sequence Number (Description)":
          "QUALITY PLAN - INSPECTION AND TEST PLAN",
        "Rev Category": "1",
        "Doc Number": "C",
        Copies: "3",
        "Copy Type": "C",
        E: "",
        ES: "",
        D: "✓",
        "Vendor Date": "Planned Date",
        "Date Received": "Status",
      },
      {
        Sequence: "2",
        Rev: "C",
        "Doc No": "G318V",
        "Sequence Number (Description)":
          "WAUKAU AC CUTTING ANTIFOAM DELIVERY TANK CHARTS CONTROL SCHEME",
        "Rev Category": "1",
        "Doc Number": "C",
        Copies: "3",
        "Copy Type": "C",
        E: "",
        ES: "",
        D: "✓",
        "Vendor Date": "22-FEB-2008",
        "Date Received": "ACK",
      },
      {
        Sequence: "",
        Rev: "",
        "Doc No": "",
        "Sequence Number (Description)": "",
        "Rev Category": "",
        "Doc Number": "",
        Copies: "",
        "Copy Type": "",
        E: "",
        ES: "",
        D: "",
        "Vendor Date": "",
        "Date Received": "",
      },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const colWidths = [
      { wpx: 80 }, // Sequence
      { wpx: 60 }, // Rev
      { wpx: 80 }, // Doc No
      { wpx: 400 }, // Description
      { wpx: 100 }, // Rev Category
      { wpx: 100 }, // Doc Number
      { wpx: 60 }, // Copies
      { wpx: 80 }, // Copy Type
      { wpx: 40 }, // E
      { wpx: 40 }, // ES
      { wpx: 40 }, // D
      { wpx: 120 }, // Vendor Date
      { wpx: 120 }, // Date Received
    ];
    ws["!cols"] = colWidths;

    // Add instructions sheet
    const instructionsData = [
      {
        Field: "Sequence",
        Description: "Sequential number for the document",
        Example: "1, 2, 3...",
      },
      { Field: "Rev", Description: "Revision category", Example: "A, B, C" },
      {
        Field: "Doc No",
        Description: "Document number identifier",
        Example: "G318V, 2218V",
      },
      {
        Field: "Sequence Number (Description)",
        Description: "Full description of the document",
        Example: "QUALITY PLAN - INSPECTION AND TEST PLAN",
      },
      {
        Field: "Rev Category",
        Description: "Revision category number",
        Example: "1, 2, 3",
      },
      {
        Field: "Doc Number",
        Description: "Document number category",
        Example: "A, B, C",
      },
      { Field: "Copies", Description: "Number of copies", Example: "1, 2, 3" },
      { Field: "Copy Type", Description: "Type of copy", Example: "C, O, R" },
      {
        Field: "E",
        Description: "E column marker",
        Example: "Leave blank or ✓",
      },
      {
        Field: "ES",
        Description: "ES column marker",
        Example: "Leave blank or ✓",
      },
      { Field: "D", Description: "D column marker", Example: "Usually ✓" },
      {
        Field: "Vendor Date",
        Description: "Date from vendor",
        Example: "22-FEB-2008 or Planned Date",
      },
      {
        Field: "Date Received",
        Description: "Date received status",
        Example: "ACK, Status, etc.",
      },
    ];

    const instructionsWs = XLSX.utils.json_to_sheet(instructionsData);
    instructionsWs["!cols"] = [{ wpx: 200 }, { wpx: 300 }, { wpx: 200 }];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Documents");
    XLSX.utils.book_append_sheet(wb, instructionsWs, "Instructions");

    // Download file
    XLSX.writeFile(wb, "vendor_transmittal_template.xlsx");
  };

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel data to DocumentRow format
        const importedDocuments: DocumentRow[] = jsonData.map(
          (row: any, index) => ({
            seq: row["Sequence"]?.toString() || (index + 1).toString(),
            rev: row["Rev"]?.toString() || "C",
            docNo: row["Doc No"]?.toString() || "",
            sequenceNumber:
              row["Sequence Number (Description)"]?.toString() ||
              row["Sequence Number"]?.toString() ||
              "",
            revCategory: row["Rev Category"]?.toString() || "1",
            docNumber: row["Doc Number"]?.toString() || "C",
            copies: row["Copies"]?.toString() || "3",
            type: row["Copy Type"]?.toString() || "C",
            ec: row["E"]?.toString() || "",
            es: row["ES"]?.toString() || "",
            d: row["D"]?.toString() || "✓",
            vendorDate: row["Vendor Date"]?.toString() || "",
            dateReceived: row["Date Received"]?.toString() || "",
          }),
        );

        // Filter out empty rows
        const validDocuments = importedDocuments.filter(
          (doc) => doc.docNo || doc.sequenceNumber,
        );

        if (validDocuments.length > 0) {
          setDocuments(validDocuments);
          alert(
            `Successfully imported ${validDocuments.length} documents from Excel file.`,
          );
        } else {
          alert(
            "No valid document data found in the Excel file. Please check the format.",
          );
        }
      } catch (error) {
        console.error("Error reading Excel file:", error);
        alert(
          "Error reading Excel file. Please ensure it's a valid Excel file with the correct format.",
        );
      }
    };

    reader.readAsArrayBuffer(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [editingDocumentIndex, setEditingDocumentIndex] = useState<
    number | null
  >(null);
  const [sequenceNumber, setSequenceNumber] = useState("363");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentRow[]>([
    {
      seq: "1",
      rev: "C",
      docNo: "G318V",
      sequenceNumber:
        "G318V DATED 10-02-05 QUALITY PLAN - INSPECTION AND TEST PLAN",
      revCategory: "1",
      docNumber: "C",
      copies: "3",
      type: "C",
      ec: "",
      es: "",
      d: "✓",
      vendorDate: "Planned Date",
      dateReceived: "Status",
    },
    {
      seq: "2",
      rev: "C",
      docNo: "G318V",
      sequenceNumber:
        "G318V DATED 10-02-05 WAUKAU AC CUTTING ANTIFOAM DELIVERY TANK CHARTS CONTROL SCHEME",
      revCategory: "1",
      docNumber: "C",
      copies: "3",
      type: "C",
      ec: "",
      es: "",
      d: "✓",
      vendorDate: "22-FEB-2008",
      dateReceived: "ACK",
    },
    {
      seq: "3",
      rev: "C",
      docNo: "2218V",
      sequenceNumber: "UNAUTHORISED ACCESS PREVENTION AND CHEMICAL INVENTORY",
      revCategory: "1",
      docNumber: "C",
      copies: "3",
      type: "C",
      ec: "",
      es: "",
      d: "✓",
      vendorDate: "Docs",
      dateReceived: "Sub",
    },
    {
      seq: "4",
      rev: "C",
      docNo: "2318V",
      sequenceNumber: "ITVH18A CVCL CHARGER GENERAL ARRANGEMENT DRAWING",
      revCategory: "1",
      docNumber: "C",
      copies: "3",
      type: "C",
      ec: "",
      es: "",
      d: "✓",
      vendorDate: "Copies Rec",
      dateReceived: "Revision",
    },
    {
      seq: "5",
      rev: "C",
      docNo: "2318V",
      sequenceNumber: "GENERAL ARRANGEMENT",
      revCategory: "3",
      docNumber: "C",
      copies: "3",
      type: "C",
      ec: "",
      es: "",
      d: "✓",
      vendorDate: "",
      dateReceived: "",
    },
    {
      seq: "6",
      rev: "C",
      docNo: "2368V",
      sequenceNumber: "MANUALS INSTALLATION, OPERATION AND MAINTENANCE",
      revCategory: "3",
      docNumber: "C",
      copies: "3",
      type: "C",
      ec: "",
      es: "",
      d: "✓",
      vendorDate: "11. Node",
      dateReceived: "",
    },
    {
      seq: "7",
      rev: "C",
      docNo: "2478V",
      sequenceNumber: "SPARE PARTS MANUAL",
      revCategory: "3",
      docNumber: "C",
      copies: "3",
      type: "C",
      ec: "",
      es: "",
      d: "✓",
      vendorDate: "",
      dateReceived: "",
    },
    {
      seq: "8",
      rev: "C",
      docNo: "2448V",
      sequenceNumber: "COMMISSIONING INSTRUCTION AND PROCEDURES",
      revCategory: "3",
      docNumber: "C",
      copies: "3",
      type: "C",
      ec: "",
      es: "",
      d: "✓",
      vendorDate: "",
      dateReceived: "Show",
    },
    {
      seq: "9",
      rev: "C",
      docNo: "2478V",
      sequenceNumber: "LIST OF REQUIRED ERECTION EQUIPMENT",
      revCategory: "3",
      docNumber: "C",
      copies: "3",
      type: "C",
      ec: "",
      es: "",
      d: "✓",
      vendorDate: "",
      dateReceived: "",
    },
  ]);

  return (
    <div className="min-h-screen bg-[#e8e0d0] p-2 sm:p-4">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{showSuccessMessage}</span>
            <button
              onClick={() => setShowSuccessMessage(null)}
              className="text-white hover:text-gray-200 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto bg-[#f5f1e8] border-2 border-gray-400 rounded overflow-hidden">
        {/* Header */}
        <div className="bg-[#a8a8a8] text-white p-2 text-sm font-semibold border-b-2 border-gray-400">
          Vendor Transmittal
        </div>

        {/* Top Section */}
        <div className="p-2 sm:p-3 border-b border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4">
            {/* Left Column */}
            <div className="space-y-2 sm:space-y-3 md:col-span-1 lg:col-span-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium w-full sm:w-20">
                  Transmittal No
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={transmittalNo}
                    onChange={(e) => setTransmittalNo(e.target.value)}
                    className="border border-gray-400 px-2 py-1 text-xs sm:text-sm w-16 bg-white"
                  />
                  <input
                    type="text"
                    value={sequenceNumber}
                    onChange={(e) => setSequenceNumber(e.target.value)}
                    className="border border-gray-400 px-2 py-1 text-xs sm:text-sm w-12 bg-blue-100"
                  />
                  <button className="text-xs sm:text-sm underline text-blue-600">
                    Cancel
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium w-full sm:w-20">
                  Project No
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <input
                    type="text"
                    value={projectNo}
                    onChange={(e) => setProjectNo(e.target.value)}
                    className="border border-gray-400 px-2 py-1 text-xs sm:text-sm w-24 bg-white"
                  />
                  <span className="text-xs sm:text-sm">
                    AFELASE ODUABI PROJECT
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium w-full sm:w-20">
                  Client
                </label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="border border-gray-400 px-2 py-1 text-xs sm:text-sm flex-1 bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium w-full sm:w-20">
                  From:
                </label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border border-gray-400 px-2 py-1 text-xs sm:text-sm flex-1 bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium w-full sm:w-20">
                  Package No
                </label>
                <input
                  type="text"
                  value={packageNo}
                  onChange={(e) => setPackageNo(e.target.value)}
                  className="border border-gray-400 px-2 py-1 text-xs sm:text-sm flex-1 bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium w-full sm:w-20">
                  Expeditor
                </label>
                <input
                  type="text"
                  value={expeditor}
                  onChange={(e) => setExpeditor(e.target.value)}
                  className="border border-gray-400 px-2 py-1 text-xs sm:text-sm flex-1 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <label className="text-xs sm:text-sm font-medium w-full sm:w-20">
                    Award Date
                  </label>
                  <input
                    type="text"
                    value={awardDate}
                    onChange={(e) => setAwardDate(e.target.value)}
                    className="border border-gray-400 px-2 py-1 text-xs sm:text-sm w-24 bg-white"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelImport}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 text-white border border-blue-600 px-2 sm:px-3 py-1 text-xs sm:text-sm hover:bg-blue-600 min-h-[36px]"
                  >
                    IMPORT EXCEL
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="bg-green-500 text-white border border-green-600 px-2 sm:px-3 py-1 text-xs sm:text-sm hover:bg-green-600 min-h-[36px]"
                  >
                    DOWNLOAD TEMPLATE
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-2 sm:space-y-3 md:col-span-1 lg:col-span-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium w-full sm:w-16">
                  Date
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-gray-400 px-2 py-1 text-xs sm:text-sm w-24 bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium w-full sm:w-20">
                  Delivery Method
                </label>
                <input
                  type="text"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="border border-gray-400 px-2 py-1 text-xs sm:text-sm flex-1 bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium w-full sm:w-16">
                  Contact
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="border border-gray-400 px-2 py-1 text-xs sm:text-sm flex-1 bg-white"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                <button className="bg-gray-200 border border-gray-400 px-2 sm:px-3 py-1 text-xs sm:text-sm hover:bg-gray-300 w-full min-h-[36px]">
                  Create General Transmittal
                </button>
                <button className="bg-gray-200 border border-gray-400 px-2 sm:px-3 py-1 text-xs sm:text-sm hover:bg-gray-300 w-full min-h-[36px]">
                  Create Review Transmittal
                </button>
              </div>

              <div className="mt-2 lg:mt-4">
                <div
                  className="bg-[#d0d0d0] p-1 sm:p-2 text-sm border border-gray-400 cursor-pointer hover:bg-[#c0c0c0]"
                  onClick={() => setShowAttentionModal(true)}
                >
                  <div
                    className="grid gap-1 font-semibold border-b border-gray-500 pb-1 mb-2"
                    style={{ gridTemplateColumns: "1.4fr 0.5fr 0.5fr 2fr" }}
                  >
                    <span className="truncate text-xs lg:text-[10px]">
                      Attention
                    </span>
                    <span className="text-center text-xs lg:text-[10px]">
                      Action
                    </span>
                    <span className="text-center text-xs lg:text-[10px]">
                      Days
                    </span>
                    <span className="text-center whitespace-nowrap text-xs lg:text-[10px]">
                      <span className="hidden sm:inline">
                        Confirmation Date
                      </span>
                      <span className="sm:hidden">Conf Date</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    {attentionEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid gap-1 items-center"
                        style={{
                          gridTemplateColumns: "1.4fr 0.5fr 0.5fr 2fr",
                        }}
                      >
                        <span
                          className="truncate"
                          style={{ fontSize: "10px" }}
                          title={entry.name}
                        >
                          {entry.name}
                        </span>
                        <span
                          className="text-center"
                          style={{ fontSize: "10px" }}
                        >
                          {entry.action}
                        </span>
                        <span
                          className="text-center"
                          style={{ fontSize: "10px" }}
                        >
                          {entry.days}
                        </span>
                        <span
                          className="text-center truncate"
                          style={{ fontSize: "10px" }}
                          title={entry.confirmationDate}
                        >
                          {entry.confirmationDate}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 mt-2 text-center">
                    Click to edit attention details
                  </div>
                </div>
              </div>
            </div>

            {/* Far Right Column */}
            <div>
              <div
                className="border border-gray-400 p-2 bg-[#d0d0d0] cursor-pointer hover:bg-[#c0c0c0]"
                onClick={() => setShowMargentModal(true)}
              >
                <div className="text-sm font-medium mb-2">
                  {margentInfo.companyName}
                </div>
                <div className="text-xs space-y-1">
                  <div>{margentInfo.address1}</div>
                  <div>{margentInfo.address2}</div>
                  <div>{margentInfo.country}</div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="bg-gray-200 border border-gray-400 px-2 py-1 text-xs hover:bg-gray-300 min-h-[32px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      printTransmittal();
                    }}
                  >
                    Print Transmittal
                  </button>
                  <input
                    type="text"
                    value={margentInfo.printCode}
                    onChange={(e) =>
                      setMargentInfo({
                        ...margentInfo,
                        printCode: e.target.value,
                      })
                    }
                    className="border border-gray-400 px-1 py-1 text-xs w-12 bg-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-2 text-center">
                  Click to edit company details
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex items-start gap-2">
            <label className="text-sm font-medium">Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border border-gray-400 px-2 py-1 text-sm flex-1 h-16 bg-white resize-none"
            />
          </div>
        </div>

        {/* Document Table */}
        <div className="overflow-x-auto">
          <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-xs sm:text-sm font-medium text-gray-600">
              Document List
            </div>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  const newDoc: DocumentRow = {
                    seq: (documents.length + 1).toString(),
                    rev: "C",
                    docNo: "",
                    sequenceNumber: "",
                    revCategory: "1",
                    docNumber: "C",
                    copies: "3",
                    type: "C",
                    ec: "",
                    es: "",
                    d: "✓",
                    vendorDate: "",
                    dateReceived: "",
                  };
                  setDocuments([...documents, newDoc]);
                }}
                className="bg-blue-500 text-white px-2 sm:px-3 py-1 text-xs rounded hover:bg-blue-600 min-h-[36px]"
              >
                Add Document
              </button>
              <button
                onClick={() => setShowDocumentModal(true)}
                className="bg-green-500 text-white px-2 sm:px-3 py-1 text-xs rounded hover:bg-green-600 min-h-[36px]"
              >
                Bulk Edit
              </button>
            </div>
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#d0d0d0]">
                <th className="border border-gray-400 p-1 w-8">Seq</th>
                <th className="border border-gray-400 p-1 w-12">Rev Cat</th>
                <th className="border border-gray-400 p-1 w-16">Doc No</th>
                <th className="border border-gray-400 p-1">Sequence Number</th>
                <th className="border border-gray-400 p-1 w-12">
                  Rev Category
                </th>
                <th className="border border-gray-400 p-1 w-16">Doc Number</th>
                <th className="border border-gray-400 p-1 w-12">Copies</th>
                <th className="border border-gray-400 p-1 w-12">Copy Type</th>
                <th className="border border-gray-400 p-1 w-8">E</th>
                <th className="border border-gray-400 p-1 w-8">C</th>
                <th className="border border-gray-400 p-1 w-8">ES</th>
                <th className="border border-gray-400 p-1 w-8">D</th>
                <th className="border border-gray-400 p-1 w-20">Vendor Date</th>
                <th className="border border-gray-400 p-1 w-20">
                  Date Received
                </th>
                <th className="border border-gray-400 p-1 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"} hover:bg-blue-50 cursor-pointer`}
                  onClick={() => {
                    setEditingDocumentIndex(index);
                    setShowDocumentModal(true);
                  }}
                >
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.seq}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.rev}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.docNo}
                  </td>
                  <td className="border border-gray-400 p-1">
                    <div className="truncate" title={doc.sequenceNumber}>
                      {doc.sequenceNumber}
                    </div>
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.revCategory}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.docNumber}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.copies}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.type}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.ec}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.es}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.d}
                  </td>
                  <td className="border border-gray-400 p-1 text-center font-bold">
                    ✓
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.vendorDate}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    {doc.dateReceived}
                  </td>
                  <td className="border border-gray-400 p-1 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = documents.filter((_, i) => i !== index);
                        setDocuments(updated);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                      title="Delete row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-gray-600 text-center">
            Click any row to edit • Add documents using the Add Document button
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-2 bg-[#a8a8a8] flex justify-between items-center">
          <div className="text-sm text-white">FROM VENDOR TRANS</div>
          <div className="flex gap-2">
            <button className="text-xs text-white underline">Select All</button>
            <button className="text-xs text-white underline">Fin'd</button>
            <button className="text-xs text-white underline">Last</button>
          </div>
        </div>
      </div>

      {/* Attention Modal */}
      {showAttentionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-3 sm:p-6 w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                Edit Attention Details
              </h2>
              <button
                onClick={() => setShowAttentionModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {attentionEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="border border-gray-300 rounded p-4"
                >
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name/Attention
                      </label>
                      <input
                        type="text"
                        value={entry.name}
                        onChange={(e) => {
                          const updated = attentionEntries.map((item) =>
                            item.id === entry.id
                              ? { ...item, name: e.target.value }
                              : item,
                          );
                          setAttentionEntries(updated);
                        }}
                        className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Action
                      </label>
                      <input
                        type="text"
                        value={entry.action}
                        onChange={(e) => {
                          const updated = attentionEntries.map((item) =>
                            item.id === entry.id
                              ? { ...item, action: e.target.value }
                              : item,
                          );
                          setAttentionEntries(updated);
                        }}
                        className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Days
                      </label>
                      <input
                        type="text"
                        value={entry.days}
                        onChange={(e) => {
                          const updated = attentionEntries.map((item) =>
                            item.id === entry.id
                              ? { ...item, days: e.target.value }
                              : item,
                          );
                          setAttentionEntries(updated);
                        }}
                        className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Confirmation Date
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={entry.confirmationDate}
                          onChange={(e) => {
                            const updated = attentionEntries.map((item) =>
                              item.id === entry.id
                                ? { ...item, confirmationDate: e.target.value }
                                : item,
                            );
                            setAttentionEntries(updated);
                          }}
                          className="flex-1 border border-gray-400 px-3 py-2 text-sm rounded"
                        />
                        <button
                          onClick={() => {
                            const updated = attentionEntries.filter(
                              (item) => item.id !== entry.id,
                            );
                            setAttentionEntries(updated);
                          }}
                          className="bg-red-500 text-white px-3 py-2 text-sm rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  const newEntry: AttentionEntry = {
                    id: Date.now().toString(),
                    name: "",
                    action: "",
                    days: "",
                    confirmationDate: "",
                  };
                  setAttentionEntries([...attentionEntries, newEntry]);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add New Entry
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAttentionModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAttentionModal(false)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Margent Modal */}
      {showMargentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Company Details</h2>
              <button
                onClick={() => setShowMargentModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={margentInfo.companyName}
                  onChange={(e) =>
                    setMargentInfo({
                      ...margentInfo,
                      companyName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={margentInfo.address1}
                  onChange={(e) =>
                    setMargentInfo({ ...margentInfo, address1: e.target.value })
                  }
                  className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                  placeholder="Enter address line 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address Line 2 (City)
                </label>
                <input
                  type="text"
                  value={margentInfo.address2}
                  onChange={(e) =>
                    setMargentInfo({ ...margentInfo, address2: e.target.value })
                  }
                  className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={margentInfo.country}
                  onChange={(e) =>
                    setMargentInfo({ ...margentInfo, country: e.target.value })
                  }
                  className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Print Code
                </label>
                <input
                  type="text"
                  value={margentInfo.printCode}
                  onChange={(e) =>
                    setMargentInfo({
                      ...margentInfo,
                      printCode: e.target.value,
                    })
                  }
                  className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                  placeholder="Enter print code"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowMargentModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMargentModal(false)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingDocumentIndex !== null
                  ? `Edit Document #${editingDocumentIndex + 1}`
                  : "Bulk Edit Documents"}
              </h2>
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setEditingDocumentIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {editingDocumentIndex !== null ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sequence
                    </label>
                    <input
                      type="text"
                      value={documents[editingDocumentIndex]?.seq || ""}
                      onChange={(e) => {
                        const updated = documents.map((doc, i) =>
                          i === editingDocumentIndex
                            ? { ...doc, seq: e.target.value }
                            : doc,
                        );
                        setDocuments(updated);
                      }}
                      className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rev
                    </label>
                    <input
                      type="text"
                      value={documents[editingDocumentIndex]?.rev || ""}
                      onChange={(e) => {
                        const updated = documents.map((doc, i) =>
                          i === editingDocumentIndex
                            ? { ...doc, rev: e.target.value }
                            : doc,
                        );
                        setDocuments(updated);
                      }}
                      className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Doc No
                    </label>
                    <input
                      type="text"
                      value={documents[editingDocumentIndex]?.docNo || ""}
                      onChange={(e) => {
                        const updated = documents.map((doc, i) =>
                          i === editingDocumentIndex
                            ? { ...doc, docNo: e.target.value }
                            : doc,
                        );
                        setDocuments(updated);
                      }}
                      className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sequence Number (Description)
                  </label>
                  <textarea
                    value={
                      documents[editingDocumentIndex]?.sequenceNumber || ""
                    }
                    onChange={(e) => {
                      const updated = documents.map((doc, i) =>
                        i === editingDocumentIndex
                          ? { ...doc, sequenceNumber: e.target.value }
                          : doc,
                      );
                      setDocuments(updated);
                    }}
                    className="w-full border border-gray-400 px-3 py-2 text-sm rounded h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rev Category
                    </label>
                    <input
                      type="text"
                      value={documents[editingDocumentIndex]?.revCategory || ""}
                      onChange={(e) => {
                        const updated = documents.map((doc, i) =>
                          i === editingDocumentIndex
                            ? { ...doc, revCategory: e.target.value }
                            : doc,
                        );
                        setDocuments(updated);
                      }}
                      className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Doc Number
                    </label>
                    <input
                      type="text"
                      value={documents[editingDocumentIndex]?.docNumber || ""}
                      onChange={(e) => {
                        const updated = documents.map((doc, i) =>
                          i === editingDocumentIndex
                            ? { ...doc, docNumber: e.target.value }
                            : doc,
                        );
                        setDocuments(updated);
                      }}
                      className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Copies
                    </label>
                    <input
                      type="text"
                      value={documents[editingDocumentIndex]?.copies || ""}
                      onChange={(e) => {
                        const updated = documents.map((doc, i) =>
                          i === editingDocumentIndex
                            ? { ...doc, copies: e.target.value }
                            : doc,
                        );
                        setDocuments(updated);
                      }}
                      className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Copy Type
                    </label>
                    <input
                      type="text"
                      value={documents[editingDocumentIndex]?.type || ""}
                      onChange={(e) => {
                        const updated = documents.map((doc, i) =>
                          i === editingDocumentIndex
                            ? { ...doc, type: e.target.value }
                            : doc,
                        );
                        setDocuments(updated);
                      }}
                      className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vendor Date
                    </label>
                    <input
                      type="text"
                      value={documents[editingDocumentIndex]?.vendorDate || ""}
                      onChange={(e) => {
                        const updated = documents.map((doc, i) =>
                          i === editingDocumentIndex
                            ? { ...doc, vendorDate: e.target.value }
                            : doc,
                        );
                        setDocuments(updated);
                      }}
                      className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date Received
                    </label>
                    <input
                      type="text"
                      value={
                        documents[editingDocumentIndex]?.dateReceived || ""
                      }
                      onChange={(e) => {
                        const updated = documents.map((doc, i) =>
                          i === editingDocumentIndex
                            ? { ...doc, dateReceived: e.target.value }
                            : doc,
                        );
                        setDocuments(updated);
                      }}
                      className="w-full border border-gray-400 px-3 py-2 text-sm rounded"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        <th className="border border-gray-400 p-2 text-left">
                          Seq
                        </th>
                        <th className="border border-gray-400 p-2 text-left">
                          Doc No
                        </th>
                        <th className="border border-gray-400 p-2 text-left">
                          Description
                        </th>
                        <th className="border border-gray-400 p-2 text-left">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-400 p-2">
                            {doc.seq}
                          </td>
                          <td className="border border-gray-400 p-2">
                            {doc.docNo}
                          </td>
                          <td className="border border-gray-400 p-2">
                            <div
                              className="truncate max-w-xs"
                              title={doc.sequenceNumber}
                            >
                              {doc.sequenceNumber}
                            </div>
                          </td>
                          <td className="border border-gray-400 p-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingDocumentIndex(index);
                                }}
                                className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  const updated = documents.filter(
                                    (_, i) => i !== index,
                                  );
                                  setDocuments(updated);
                                }}
                                className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setEditingDocumentIndex(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
              {editingDocumentIndex !== null && (
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setEditingDocumentIndex(null);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

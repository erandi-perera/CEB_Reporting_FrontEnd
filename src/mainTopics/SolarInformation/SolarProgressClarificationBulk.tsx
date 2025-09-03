import React, { useState, useEffect, useRef } from "react";

interface Area {
    AreaCode: string;
    AreaName: string;
    ErrorMessage?: string | null;
}

interface Province {
    ProvinceCode: string;
    ProvinceName: string;
    ErrorMessage?: string | null;
}

interface Division {
    RegionCode: string;
    ErrorMessage?: string | null;
}

interface BillCycleOption {
    display: string;
    code: string;
}

interface DetailedSolarProgress {
    Region: string;
    Province: string;
    Area: string;
    AccountNumber: string;
    NetType: string;
    Description: string;
    Capacity: number;
    FromArea: string;
    ToArea: string;
    FromNetType: string;
    ToNetType: string;
}

interface SummarySolarProgress {
    Region: string;
    Province: string;
    Area: string;
    Description: string;
    Count: number;
    Capacity: number;
}

const SolarProgressClarificationBulk: React.FC = () => {
    const maroon = "text-[#7A0000]";
    const maroonGrad = "bg-gradient-to-r from-[#7A0000] to-[#A52A2A]";

    const [selectedOption, setSelectedOption] = useState<string>("Area");
    const [inputValue, setInputValue] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [areas, setAreas] = useState<Area[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [billCycleOptions, setBillCycleOptions] = useState<BillCycleOption[]>([]);
    const [isLoadingAreas, setIsLoadingAreas] = useState(false);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingDivisions, setIsLoadingDivisions] = useState(false);
    const [isLoadingBillCycles, setIsLoadingBillCycles] = useState(false);
    const [areaError, setAreaError] = useState<string | null>(null);
    const [provinceError, setProvinceError] = useState<string | null>(null);
    const [divisionError, setDivisionError] = useState<string | null>(null);
    const [billCycleError, setBillCycleError] = useState<string | null>(null);
    const [reportType, setReportType] = useState<string>("");
    const [billCycleValue, setBillCycleValue] = useState<string>(""); // New state for bill cycle value
    const [selectedAreaName, setSelectedAreaName] = useState<string>(""); // Store selected area name
    const [selectedBillCycleDisplay, setSelectedBillCycleDisplay] = useState<string>(""); // Store bill cycle display text
    const [reportVisible, setReportVisible] = useState(false);
    const [detailedData, setDetailedData] = useState<DetailedSolarProgress[]>([]);
    const [summaryData, setSummaryData] = useState<SummarySolarProgress[]>([]);
    const [reportError, setReportError] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Helper function for error handling 
    const fetchWithErrorHandling = async (url: string) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.errorMessage) {
                        errorMsg = errorData.errorMessage;
                    }
                } catch (e) {
                    errorMsg = response.statusText;
                }
                throw new Error(errorMsg);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Expected JSON response but got ${contentType}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        }
    };

    // Generate bill cycle options 
    const generateBillCycleOptions = (billCycles: string[], maxCycle: string): BillCycleOption[] => {
        const maxCycleNum = parseInt(maxCycle);
        return billCycles.map((cycle, index) => ({
            display: `${(maxCycleNum - index).toString()} - ${cycle}`,
            // display: cycle,
            code: (maxCycleNum - index).toString()
        }));
    };

    // Fetch areas 
    useEffect(() => {
        const fetchAreas = async () => {
            setIsLoadingAreas(true);
            setAreaError(null);
            try {
                // Using the same API endpoint pattern as AgeAnalysis
                const areaData = await fetchWithErrorHandling("/bulkapi/areas");
                setAreas(areaData.data || []);
            } catch (err: any) {
                console.error("Error fetching areas:", err);
                setAreaError(err.message || "Failed to load areas. Please try again later.");
            } finally {
                setIsLoadingAreas(false);
            }
        };

        fetchAreas();
    }, []);

    // Fetch provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            setIsLoadingProvinces(true);
            setProvinceError(null);
            try {
                const provinceData = await fetchWithErrorHandling("/bulkapi/province");
                setProvinces(provinceData.data || []);
            } catch (err: any) {
                console.error("Error fetching provinces:", err);
                setProvinceError(err.message || "Failed to load provinces. Please try again later.");
            } finally {
                setIsLoadingProvinces(false);
            }
        };

        fetchProvinces();
    }, []);

    // Fetch divisions
    useEffect(() => {
        const fetchDivisions = async () => {
            setIsLoadingDivisions(true);
            setDivisionError(null);
            try {
                const divisionData = await fetchWithErrorHandling("/bulkapi/region");
                setDivisions(divisionData.data || []);
            } catch (err: any) {
                console.error("Error fetching divisions:", err);
                setDivisionError(err.message || "Failed to load divisions. Please try again later.");
            } finally {
                setIsLoadingDivisions(false);
            }
        };

        fetchDivisions();
    }, []);

    // Fetch bill cycles
    useEffect(() => {
        const fetchBillCycles = async () => {
            setIsLoadingBillCycles(true);
            setBillCycleError(null);
            try {
                const maxCycleData = await fetchWithErrorHandling("/bulkapi/billcycle/max");
                if (maxCycleData.data && maxCycleData.data.BillCycles?.length > 0) {
                    const options = generateBillCycleOptions(
                        maxCycleData.data.BillCycles,
                        maxCycleData.data.MaxBillCycle
                    );
                    setBillCycleOptions(options);
                } else {
                    setBillCycleOptions([]);
                }
            } catch (err: any) {
                console.error("Error fetching bill cycles:", err);
                setBillCycleError(err.message || "Failed to load bill cycles. Please try again later.");
            } finally {
                setIsLoadingBillCycles(false);
            }
        };

        fetchBillCycles();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedOption(value);

        // reset all dependent values
        setInputValue("");
        setBillCycleValue("");
        setReportType("");
        setSelectedAreaName("");
        setSelectedBillCycleDisplay("");
    };

    const formatCurrency = (value: number): string => {
        return value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const downloadAsCSV = () => {
        if (reportType === "detailed" && !detailedData.length) return;
        if (reportType === "summary" && !summaryData.length) return;

        let csvContent = "";
        let headers: string[] = [];
        let rows: any[] = [];

        if (reportType === "detailed") {
            headers = [
                "Region",
                "Province",
                "Area",
                "Account Number",
                "Net Type",
                "Description",
                "Capacity",
                "From Area",
                "To Area",
                "From Net Type",
                "To Net Type"
            ];

            rows = detailedData.map(item => [
                item.Region,
                item.Province,
                item.Area,
                item.AccountNumber,
                item.NetType,
                item.Description,
                item.Capacity,
                item.FromArea,
                item.ToArea,
                item.FromNetType,
                item.ToNetType
            ]);

            // Add totals row if multiple items
            // if (detailedData.length > 1) {
            //     rows.push([
            //         "", "", "", "", "", "TOTAL:",
            //         formatCurrency(detailedData.reduce((sum, item) => sum + item.Capacity, 0)),
            //         "", "", "", ""
            //     ]);
            // }
        } else {
            headers = [
                "Region",
                "Province",
                "Area",
                "Description",
                "Count",
                "Capacity"
            ];

            rows = summaryData.map(item => [
                item.Region,
                item.Province,
                item.Area,
                item.Description,
                item.Count,
                item.Capacity
            ]);

            // Add totals row if multiple items
            // if (summaryData.length > 1) {
            //     rows.push([
            //         "", "", "", "TOTAL:",
            //         summaryData.reduce((sum, item) => sum + item.Count, 0),
            //         formatCurrency(summaryData.reduce((sum, item) => sum + item.Capacity, 0))
            //     ]);
            // }
        }

        const reportTitle = reportType === "detailed"
            ? "Solar Progress Detailed Report"
            : "Solar Progress Summary Report";

        const selectionInfo = selectedOption === "Entire CEB"
            ? "Entire CEB"
            : selectedOption === "Area" 
                ? `${selectedOption}: ${selectedAreaName}` 
                : `${selectedOption}: ${inputValue}`;

        csvContent = [
            reportTitle,
            selectionInfo,
            `Bill Cycle: ${selectedBillCycleDisplay}`,
            `Generated: ${new Date().toLocaleDateString()}`,
            "",
            headers.map((h) => `"${h}"`).join(","),
            ...rows.map((row) => row.map((cell: any) => `"${cell}"`).join(",")),
        ].join("\n");

        try {
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            const fileDescriptor = selectedOption === "Entire CEB"
                ? "EntireCEB"
                : selectedOption === "Area"
                    ? `${selectedOption}_${selectedAreaName}`
                    : `${selectedOption}_${inputValue}`;

            const reportTypeName = reportType === "detailed" ? "Detailed" : "Summary";

            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `SolarProgress_${reportTypeName}_${fileDescriptor}_BillCycle_${billCycleValue}.csv`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error("Error generating CSV:", error);
            alert("Failed to export CSV");
        }
    };

    const printPDF = () => {
        if (!printRef.current) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const reportTitle = reportType === "detailed"
            ? "SOLAR PROGRESS DETAILED REPORT"
            : "SOLAR PROGRESS SUMMARY REPORT";

        const selectionInfo = (() => {
            if (selectedOption === "Entire CEB") {
                return "Entire CEB";
            } else if (selectedOption === "Area") {
                return `${selectedOption}: <span class="bold">${selectedAreaName}</span>`;
            } else {
                return `${selectedOption}: <span class="bold">${inputValue}</span>`;
            }
        })();

        printWindow.document.write(`
      <html>
        <head>
          <title>Solar Progress Report</title>
          <style>
            body { font-family: Arial; font-size: 10px; margin: 10mm; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 2px 4px; border: 1px solid #ddd; font-size: 10px; vertical-align: top;}
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .header { 
              font-weight: bold; 
              margin-bottom: 5px; 
              color: #7A0000;
              font-size: 12px;
            }
            .subheader { 
              margin-bottom: 12px; 
              font-size: 11px;
            }
            .footer { 
              margin-top: 10px; 
              font-size: 9px; 
              color: #666;
            }
            .total-row { 
              font-weight: bold; 
              background-color: #f5f5f5; 
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold; 
              text-align: left; 
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .bold {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">${reportTitle}</div>
          <div class="subheader">
            ${selectionInfo}<br>
            Bill Cycle: <span class="bold">${selectedBillCycleDisplay}</span>
          </div>
          ${printRef.current.innerHTML}
          <div class="footer">
            Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | CEB@2025
          </div>
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const renderDetailedTable = () => {
        // Group data and calculate rowspans
        const groupedData = detailedData.reduce((acc, item, index) => {
            const regionKey = item.Region;
            const provinceKey = `${item.Region}-${item.Province}`;
            const areaKey = `${item.Region}-${item.Province}-${item.Area}`;
            
            if (!acc.regionCounts[regionKey]) acc.regionCounts[regionKey] = 0;
            if (!acc.provinceCounts[provinceKey]) acc.provinceCounts[provinceKey] = 0;
            if (!acc.areaCounts[areaKey]) acc.areaCounts[areaKey] = 0;
            
            acc.regionCounts[regionKey]++;
            acc.provinceCounts[provinceKey]++;
            acc.areaCounts[areaKey]++;
            
            acc.items.push({ ...item, index });
            return acc;
        }, { 
    regionCounts: {} as Record<string, number>, 
    provinceCounts: {} as Record<string, number>, 
    areaCounts: {} as Record<string, number>, 
    items: [] as any[]
});

        let currentRegion = '';
        let currentProvince = '';
        let currentArea = '';
        let regionRowsRemaining = 0;
        let provinceRowsRemaining = 0;
        let areaRowsRemaining = 0;

        return (
            <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-100 sticky top-0">
                    <tr>
                        <th className="border border-gray-300 px-2 py-1 text-left">Region</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Province</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Area</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Account Number</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Net Type</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Description</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Capacity</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">From Area</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">To Area</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">From Net Type</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">To Net Type</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedData.items.map((item, index) => {
                        const regionKey = item.Region;
                        const provinceKey = `${item.Region}-${item.Province}`;
                        const areaKey = `${item.Region}-${item.Province}-${item.Area}`;
                        
                        // Check if we need to show region cell
                        const showRegion = currentRegion !== regionKey;
                        if (showRegion) {
                            currentRegion = regionKey;
                            regionRowsRemaining = groupedData.regionCounts[regionKey];
                        }
                        
                        // Check if we need to show province cell
                        const showProvince = currentProvince !== provinceKey;
                        if (showProvince) {
                            currentProvince = provinceKey;
                            provinceRowsRemaining = groupedData.provinceCounts[provinceKey];
                        }
                        
                        // Check if we need to show area cell
                        const showArea = currentArea !== areaKey;
                        if (showArea) {
                            currentArea = areaKey;
                            areaRowsRemaining = groupedData.areaCounts[areaKey];
                        }

                        return (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                {showRegion && (
                                    <td className="border border-gray-300 px-2 py-1 align-top" rowSpan={regionRowsRemaining}>
                                        {item.Region}
                                    </td>
                                )}
                                {showProvince && (
                                    <td className="border border-gray-300 px-2 py-1 align-top" rowSpan={provinceRowsRemaining}>
                                        {item.Province}
                                    </td>
                                )}
                                {showArea && (
                                    <td className="border border-gray-300 px-2 py-1 align-top" rowSpan={areaRowsRemaining}>
                                        {item.Area}
                                    </td>
                                )}
                                <td className="border border-gray-300 px-2 py-1">{item.AccountNumber}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.NetType}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.Description}</td>
                                <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(item.Capacity)}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.FromArea}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.ToArea}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.FromNetType}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.ToNetType}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const renderSummaryTable = () => {
        // Group data and calculate rowspans
        const groupedData = summaryData.reduce((acc, item, index) => {
            const regionKey = item.Region;
            const provinceKey = `${item.Region}-${item.Province}`;
            const areaKey = `${item.Region}-${item.Province}-${item.Area}`;
            
            if (!acc.regionCounts[regionKey]) acc.regionCounts[regionKey] = 0;
            if (!acc.provinceCounts[provinceKey]) acc.provinceCounts[provinceKey] = 0;
            if (!acc.areaCounts[areaKey]) acc.areaCounts[areaKey] = 0;
            
            acc.regionCounts[regionKey]++;
            acc.provinceCounts[provinceKey]++;
            acc.areaCounts[areaKey]++;
            
            acc.items.push({ ...item, index });
            return acc;
        }, { 
    regionCounts: {} as Record<string, number>, 
    provinceCounts: {} as Record<string, number>, 
    areaCounts: {} as Record<string, number>, 
    items: [] as any[]
});
        let currentRegion = '';
        let currentProvince = '';
        let currentArea = '';
        let regionRowsRemaining = 0;
        let provinceRowsRemaining = 0;
        let areaRowsRemaining = 0;

        return (
            <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-100 sticky top-0">
                    <tr>
                        <th className="border border-gray-300 px-2 py-1 text-left">Region</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Province</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Area</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Description</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Count</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Capacity</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedData.items.map((item, index) => {
                        const regionKey = item.Region;
                        const provinceKey = `${item.Region}-${item.Province}`;
                        const areaKey = `${item.Region}-${item.Province}-${item.Area}`;
                        
                        // Check if we need to show region cell
                        const showRegion = currentRegion !== regionKey;
                        if (showRegion) {
                            currentRegion = regionKey;
                            regionRowsRemaining = groupedData.regionCounts[regionKey];
                        }
                        
                        // Check if we need to show province cell
                        const showProvince = currentProvince !== provinceKey;
                        if (showProvince) {
                            currentProvince = provinceKey;
                            provinceRowsRemaining = groupedData.provinceCounts[provinceKey];
                        }
                        
                        // Check if we need to show area cell
                        const showArea = currentArea !== areaKey;
                        if (showArea) {
                            currentArea = areaKey;
                            areaRowsRemaining = groupedData.areaCounts[areaKey];
                        }

                        return (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                {showRegion && (
                                    <td className="border border-gray-300 px-2 py-1 align-top" rowSpan={regionRowsRemaining}>
                                        {item.Region}
                                    </td>
                                )}
                                {showProvince && (
                                    <td className="border border-gray-300 px-2 py-1 align-top" rowSpan={provinceRowsRemaining}>
                                        {item.Province}
                                    </td>
                                )}
                                {showArea && (
                                    <td className="border border-gray-300 px-2 py-1 align-top" rowSpan={areaRowsRemaining}>
                                        {item.Area}
                                    </td>
                                )}
                                <td className="border border-gray-300 px-2 py-1">{item.Description}</td>
                                <td className="border border-gray-300 px-2 py-1 text-right">{item.Count}</td>
                                <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(item.Capacity)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setReportError(null);
        setDetailedData([]);
        setSummaryData([]);
        setReportVisible(false);

        try {
            let endpoint = "";
            let validationError = "";

            // Validate inputs
            if (!billCycleValue) validationError = "Bill cycle is required";
            if (!reportType) validationError = "Report type is required";
            if (selectedOption !== "Entire CEB" && !inputValue) {
                validationError = `${selectedOption} is required`;
            }

            if (validationError) {
                throw new Error(validationError);
            }

            // Build API URL
            
            const typeCode = selectedOption === "Entire CEB" ? "" : inputValue;
            let reportTypeParam = "";

            if (selectedOption === "Entire CEB") {
                reportTypeParam = "EntireCeb";
            } else if (selectedOption === "Area") {
                reportTypeParam = "Area";
            } else if (selectedOption === "Province") {
                reportTypeParam = "Province";
            } else if (selectedOption === "Division") {
                reportTypeParam = "Region"; // Assuming "Division" maps to "Region" in the API
            }

            endpoint = `/bulkapi/solar-progress/${reportType}?billCycle=${billCycleValue}&reportType=${reportTypeParam}`;

            // Only add typeCode parameter if it's not Entire CEB
            if (selectedOption !== "Entire CEB") {
                endpoint += `&typeCode=${typeCode}`;
            }

            console.log("Making API call to:", endpoint);

            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });

            console.log("Response status:", response.status);

            // HTTP error handling
            if (!response.ok) {
                let errorMsg = `HTTP error ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.errorMessage) {
                        errorMsg = errorData.errorMessage;
                    } else if (errorData.message) {
                        errorMsg = errorData.message;
                    }
                } catch (e) {
                    errorMsg = `${errorMsg}: ${await response.text()}`;
                }
                throw new Error(errorMsg);
            }

            // Content type verification
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Expected JSON but got ${contentType}`);
            }

            // Process successful response
            const result = await response.json();
            console.log("API result:", result);

            // Handle response data
            if (reportType === "detailed") {
                const responseData = result.data || result;
                const detailedData = Array.isArray(responseData) ? responseData : [responseData];
                setDetailedData(detailedData);
            } else {
                const responseData = result.data || result;
                const summaryData = Array.isArray(responseData) ? responseData : [responseData];
                setSummaryData(summaryData);
            }

            setReportVisible(true);
        } catch (err: any) {
            console.error("Error in form submission:", err);
            if (err.message.includes("Failed to fetch")) {
                setReportError("Network error - please check your connection");
            } else {
                setReportError(err.message || "Failed to load solar progress data");
            }
        } finally {
            setLoading(false);
        }
    };

    const formatAreaOption = (area: Area) => {
        return `${area.AreaCode} - ${area.AreaName}`;
    };

    const formatProvinceOption = (province: Province) => {
        return `${province.ProvinceCode} - ${province.ProvinceName}`;
    };

    const formatDivisionOption = (division: Division) => {
        return `${division.RegionCode}`;
    };

    // Check if report type dropdown should be disabled
    const isReportTypeDisabled = () => {
        if (selectedOption === "Entire CEB") {
            // For Entire CEB, only need bill cycle
            return !billCycleValue || isLoadingBillCycles || billCycleError !== null;
        }

        return !inputValue || !billCycleValue ||
            (selectedOption === "Area" && (isLoadingAreas || areaError !== null)) ||
            (selectedOption === "Province" && (isLoadingProvinces || provinceError !== null)) ||
            (selectedOption === "Division" && (isLoadingDivisions || divisionError !== null)) ||
            isLoadingBillCycles || billCycleError !== null;
    };

    return (
        <div className="max-w-7xl mx-auto p-4 bg-white rounded-xl shadow border border-gray-200 text-sm font-sans">
            {/* Form Section */}
            {!reportVisible && (
                <>
                    <h2 className={`text-xl font-bold mb-6 ${maroon}`}>
                        Solar Progress Clarification (Bulk)
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {/* Dropdown for selection type */}
                            <div className="flex flex-col">
                                <label className={`${maroon} text-xs font-medium mb-1`}>
                                    Select Option:
                                </label>
                                <select
                                    value={selectedOption}
                                    onChange={handleChange}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7A0000] focus:border-transparent"
                                    required
                                >
                                    <option value="Area">Area</option>
                                    <option value="Province">Province</option>
                                    <option value="Division">Division</option>
                                    <option value="Entire CEB">Entire CEB</option>
                                </select>
                            </div>

                            {/* Conditional dropdown based on selection */}
                            {selectedOption === "Area" && (
                                <div className="flex flex-col">
                                    <label className={`${maroon} text-xs font-medium mb-1`}>
                                        Select Area:
                                    </label>
                                    {isLoadingAreas ? (
                                        <div className="flex items-center justify-center py-2">
                                            <svg
                                                className="animate-spin h-5 w-5 text-[#7A0000]"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span className="ml-2 text-xs">Loading areas...</span>
                                        </div>
                                    ) : areaError ? (
                                        <div className="text-red-500 text-xs py-2">{areaError}</div>
                                    ) : (
                                        <select
                                            value={inputValue}
                                            onChange={(e) => {
                                                const selectedAreaCode = e.target.value;
                                                setInputValue(selectedAreaCode);
                                                // Find and store the area name
                                                const selectedArea = areas.find(area => area.AreaCode === selectedAreaCode);
                                                setSelectedAreaName(selectedArea ? selectedArea.AreaName : "");
                                            }}
                                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7A0000] focus:border-transparent"
                                            required
                                            disabled={isLoadingAreas || areaError !== null}
                                        >
                                            <option value="">Select Area</option>
                                            {areas.map((area) => (
                                                <option key={area.AreaCode} value={area.AreaCode}>
                                                    {formatAreaOption(area)}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {selectedOption === "Province" && (
                                <div className="flex flex-col">
                                    <label className={`${maroon} text-xs font-medium mb-1`}>
                                        Select Province:
                                    </label>
                                    {isLoadingProvinces ? (
                                        <div className="flex items-center justify-center py-2">
                                            <svg
                                                className="animate-spin h-5 w-5 text-[#7A0000]"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span className="ml-2 text-xs">Loading provinces...</span>
                                        </div>
                                    ) : provinceError ? (
                                        <div className="text-red-500 text-xs py-2">{provinceError}</div>
                                    ) : (
                                        <select
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7A0000] focus:border-transparent"
                                            required
                                            disabled={isLoadingProvinces || provinceError !== null}
                                        >
                                            <option value="">Select Province</option>
                                            {provinces.map((province) => (
                                                <option key={province.ProvinceCode} value={province.ProvinceCode}>
                                                    {formatProvinceOption(province)}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {selectedOption === "Division" && (
                                <div className="flex flex-col">
                                    <label className={`${maroon} text-xs font-medium mb-1`}>
                                        Select Division:
                                    </label>
                                    {isLoadingDivisions ? (
                                        <div className="flex items-center justify-center py-2">
                                            <svg
                                                className="animate-spin h-5 w-5 text-[#7A0000]"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span className="ml-2 text-xs">Loading divisions...</span>
                                        </div>
                                    ) : divisionError ? (
                                        <div className="text-red-500 text-xs py-2">{divisionError}</div>
                                    ) : (
                                        <select
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7A0000] focus:border-transparent"
                                            required
                                            disabled={isLoadingDivisions || divisionError !== null}
                                        >
                                            <option value="">Select Division</option>
                                            {divisions.map((division) => (
                                                <option key={division.RegionCode} value={division.RegionCode}>
                                                    {formatDivisionOption(division)}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* Bill Cycle Dropdown*/}
                            <div className="flex flex-col">
                                <label
                                    className={`text-xs font-medium mb-1 ${(isLoadingBillCycles || billCycleError !== null ||
                                        (selectedOption === "Area" && !inputValue) ||
                                        (selectedOption === "Province" && !inputValue) ||
                                        (selectedOption === "Division" && !inputValue))
                                        ? "text-gray-400" // light gray when disabled
                                        : maroon
                                        }`}
                                >
                                    Select Bill Cycle:
                                </label>
                                {isLoadingBillCycles ? (
                                    <div className="flex items-center justify-center py-2">
                                        <svg
                                            className="animate-spin h-5 w-5 text-[#7A0000]"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        <span className="ml-2 text-xs">Loading cycles...</span>
                                    </div>
                                ) : billCycleError ? (
                                    <div className="text-red-500 text-xs py-2">{billCycleError}</div>
                                ) : (
                                    <select
                                        value={billCycleValue}
                                        onChange={(e) => {
                                            const selectedCode = e.target.value;
                                            setBillCycleValue(selectedCode);
                                            // Find and store the bill cycle display text
                                            const selectedOption = billCycleOptions.find(option => option.code === selectedCode);
                                            setSelectedBillCycleDisplay(selectedOption ? selectedOption.display : "");
                                        }}
                                        className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-[#7A0000] focus:border-transparent
            ${(isLoadingBillCycles || billCycleError !== null ||
                                                (selectedOption === "Area" && !inputValue) ||
                                                (selectedOption === "Province" && !inputValue) ||
                                                (selectedOption === "Division" && !inputValue))
                                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                : "border-gray-300"
                                            }`}
                                        required
                                        disabled={
                                            isLoadingBillCycles ||
                                            billCycleError !== null ||
                                            (
                                                selectedOption !== "Entire CEB" && !inputValue // only enforce inputValue for Area/Province/Division
                                            )
                                        }

                                    >
                                        <option value="">Select Bill Cycle</option>
                                        {billCycleOptions.map((option) => (
                                            <option key={option.code} value={option.code}>
                                                {option.display}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Report Type Dropdown */}
                            <div className="flex flex-col">
                                <label
                                    className={`text-xs font-medium mb-1 ${isReportTypeDisabled()
                                        ? "text-gray-400" // light gray when disabled
                                        : maroon
                                        }`}
                                >
                                    Select Report Type:
                                </label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-[#7A0000] focus:border-transparent
                                ${isReportTypeDisabled()
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                            : "border-gray-300"
                                        }`}
                                    required
                                    disabled={isReportTypeDisabled()}
                                >
                                    <option value="">Select Report Type</option>
                                    <option value="detailed">Detailed Report</option>
                                    <option value="summary">Summary Report</option>
                                </select>
                            </div>

                        </div>

                        {/* Submit button */}
                        <div className="w-full mt-6 flex justify-end">
                            <button
                                type="submit"
                                className={`px-6 py-2 rounded-md font-medium transition-opacity duration-300 shadow
                            ${maroonGrad} text-white ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
                                disabled={loading || isReportTypeDisabled() || !reportType}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Loading...
                                    </span>
                                ) : (
                                    "Generate Report"
                                )}
                            </button>
                        </div>
                    </form>
                </>
            )}
            {/* Report Section */}
            {reportVisible && (
                <div className="mt-6">
                    {/* Report Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div>
                            <h2 className={`text-xl font-bold ${maroon}`}>
                                {reportType === "detailed" ? "Solar Progress Detailed Report" : "Solar Progress Summary Report"}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {selectedOption === "Entire CEB" 
                                    ? "Entire CEB" 
                                    : selectedOption === "Area" 
                                        ? `${selectedOption}: ${selectedAreaName}` 
                                        : `${selectedOption}: ${inputValue}`} | Bill Cycle: {selectedBillCycleDisplay}
                            </p>
                        </div>
                        <div className="flex space-x-2 mt-2 md:mt-0">
                            <button
                                onClick={downloadAsCSV}
                                className="px-4 py-1.5 bg-white border border-gray-300 text-xs rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                Export CSV
                            </button>
                            <button
                                onClick={printPDF}
                                className="px-4 py-1.5 bg-white border border-gray-300 text-xs rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"
                                    />
                                </svg>
                                Print PDF
                            </button>
                            <button
                                onClick={() => setReportVisible(false)}
                                className="px-4 py-1.5 bg-white border border-gray-300 text-xs rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Report Table */}
                    <div className="overflow-x-auto max-h-[calc(100vh-250px)] border border-gray-300 rounded-lg">
                        <div ref={printRef} className="min-w-full">
                            {reportType === "detailed" ? renderDetailedTable() : renderSummaryTable()}
                        </div>
                    </div>

                    {/* Error Message */}
                    {reportError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {reportError}
                        </div>
                    )}
                </div>
            )}

            {/* Error Message (when not in report view) */}
            {!reportVisible && reportError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {reportError}
                </div>
            )}
        </div>
    );
};

export default SolarProgressClarificationBulk;
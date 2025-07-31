namespace mdg.commons;

type t_Mara  {
   MATNR   : String(40);  
   MAKT_MAKTX      :String(100);   // Material Description
   BISMT           : String(40);   // Old Material Number
   LVORM           : Boolean;    // Deletion Indicator
   MATKL           : String(9);    // Material Group
   MBRSH           : String(1);    // Industry Sector
   MEINS          : String(3);    // Base Unit of Measure
  //  MEINS_UOM       : String(3);
   MSTAE : String(2);   // Cross-Plant Material Status
   MSTDE : Date;        // Date from which the Cross-Plant Material Status is Valid
   MTART           : String(4);    // Material Type
  //  MTART_Material_type  : String(4);
   SPART : String(2);    // Division
   EXTWG : String(18);   // External Material Group
   MAGRV : String(4);    // Material Group: Packaging Materials
   MTPOS_MARA : String(4); // General Item Category Group
   PRDHA : String(18);   // Product Hierarchy
   WRKST           : String(48);   // Basic Material
   EAN11 : String(18);   // International Article Number (EAN/UPC)
   VOLEH: String(3); // Volume Unit
   VOLUM           : Decimal(13, 3); // Volume
   LAENG:Integer;
   BREIT:Integer;
   HOEHE:Integer;
   CUOBF:Integer;
   NTGEW:Decimal(13, 3);//Net Weight
   GEWEI:String(3);//Weight Unit
   BRGEW:Decimal(13, 3);//Gross Wight
   MEABM:String(3); //UNit of length/width/height
   SLED_BBD:String(1);//Expiration Date
   MHDHB:String(4);//Total Shelf Life
   RAUBE:String(2);//Storage conditions
   MHDRZ:String(4);//Minimum Remaining Shelf Life
   IPRKZ:String(1);//Period Indicator for Shelf Life Expiration Date
   TRAGR:String(4);//Transportation Group
   EKWSL:String(4);//Purchasing Value Key
   QMPUR:Boolean;//QM in Procurement Is Active
   Request_Desc      : String;
} 
type t_plant{
  mat_plant_MATNR : String(40);
  WERKS : String;
  New_WERKS : String;
  // WERKS_WERKS: String ;
  MMSTA: String(2);	//Plant-Specific Material Status
  PRCTR: String(10); //Profit Center
  // PRCTR_PRCTR: String(10);
  XCHPF_marc:Boolean;//Batch Management Requirement Indicator
  DISMM:String(2);//MRP Type
  MAABC:String(1);//ABC Indicator
  DISPO:String(3);//MRP Controller
  BESKZ:String(1);//Procurement Type
  EKGRP:String(3);//Purchasing Group
  LVORM: Boolean;    // Deletion Indicator
  FIXLS:Decimal(13,3);//Fixed lot size for Supply Demand Match
  //SCM_GRPRT:Integer;//Goods Receipt Processing Time
  LADGR : String(4); //Loading Group
  MTVFP:String(2);//Checking Group for availaility check
  DGRMRPPP:String;//Material Requirements Planning (MRP) Group
  RDPRF:String(4);//Rounding Profile
  DISLS:String(2);//Lot Sizing Procedure within Materials Planning
  BSTFE:Decimal(13,3);//Fixed Lot Size
  SCM_GRPRT:String;//Goods Reciept Processing time -- need to checked
  BSTMA:Decimal(13,3);//Maximum lot size
  BSTMI:Decimal(13,3);//Minimum lot size
  BEARZ:Decimal(5,2);//processing Time
  HERKL:String(3);//Country of Origin of Material (Non-Preferential Origin)
}

type t_Storage_Location{
   plant_mat_plant_MATNR : String(40);
   plant_WERKS: String;
   LGORT:String(4);//Storage Location
   LGPBE:String;//Storage Bin
}

type t_Description{
    Material_MATNR : String(40);
    code:String(4);
    Description:String;
}
type t_Warehouse {
    Material_MATNR      : String(40);   // Material Number
    LGNUM               : String(3);    // Warehouse Number / Warehouse Complex
    LVORM               : Boolean;      // Deletion flag for all material data of a warehouse number
    LGBKZ               : String(3);    // Storage Section Indicators
    LTKZE               : String(3);    // Storage type indicator for stock placement
    LTKZA               : String(3);    // Storage type indicator for stock removal
    LHMG1               : Decimal(13, 3); // Loading equipment quantity 1
    LHMG2               : Decimal(13, 3); // Loading equipment quantity 2
    LHMG3               : Decimal(13, 3); // Loading equipment quantity 3
    LHME1               : String(3);    // Unit of measure for loading equipment quantity 1
    LHME2               : String(3);    // Unit of measure for loading equipment quantity 2
    LHME3               : String(3);    // Unit of measure for loading equipment quantity 3
    LETY1               : String(3);    // 1st storage unit type
    LETY2               : String(3);    // 2nd storage unit type
    LETY3               : String(3);    // 3rd storage unit type
    LVSME               : String(3);    // Warehouse Management Unit of Measure
    KZZUL               : Boolean;      // Indicator: Allow addition to existing stock
    BLOCK               : String(2);    // Bulk Storage Indicators
    KZMBF               : Boolean;      // Indicator: Message to inventory management
    BSSKZ               : Boolean;      // Special movement indicator for warehouse management
    MKAPV               : Decimal(11, 3); // Capacity usage
    BEZME               : String(3);    // Unit of measure for capacity consumption
    PLKPT               : String(3);    // Picking storage type for rough-cut and detailed planning
    VOMEM               : String(1);    // Default for unit of measure from material master record
    L2SKR               : String(1);    // Material relevance for 2-step picking
}

type t_Storage_type {
    Warehouse_Material_MATNR : String(40);   // Material Number
    Warehouse_LGNUM          : String(3);    // Warehouse Number / Warehouse Complex
    LGTYP                    : String(3);    // Storage Type
    LVORM                    : Boolean;      // Deletion flag for all material data of a storage type
    LGPLA                    : String(10);   // Storage Bin
    LPMAX                    : Decimal(13, 3); // Maximum storage bin quantity
    LPMIN                    : Decimal(13, 3); // Minimum storage bin quantity
    MAMNG                    : Decimal(13, 3); // Control quantity
    NSMNG                    : Decimal(13, 3); // Replenishment quantity
    KOBER                    : String(3);    // Picking Area
}

type t_Alternate_UOM {
    Material_MATNR : String(40);   // Material Number
    MEINH          : String(3);    // Alternative Unit of Measure for Stockkeeping Unit
    UMREZ          : Decimal(5, 0); // Numerator for Conversion to Base Units of Measure
    UMREN          : Decimal(5, 0); // Denominator for conversion to base units of measure
    EANNR          : String(13);   // International Article Number (EAN/UPC)
    EAN11          : String(18);   // Category of International Article Number (EAN)
    NUMTP          : String(2);    // European Article Number (EAN) - obsolete!!!!!
    LAENG          : Decimal(13, 3); // Length
    BREIT          : Decimal(13, 3); // Width
    HOEHE          : Decimal(13, 3); // Height
    MEABM          : String(3);    // Unit of Dimension for Length/Width/Height
    VOLUM          : Decimal(13, 3); // Volume
    VOLEH          : String(3);    // Volume Unit
    BRGEW          : Decimal(13, 3); // Gross Weight
    GEWEI          : String(3);    // Unit of Weight
}

type t_Sales_Delivery {
    Material_MATNR : String(40);   // Material Number
    VKORG          : String(4);    // Sales Organization
    VTWEG          : String(2);    // Distribution Channel
    RDPRF          : String(4);    // Rounding Profile
    PRODH          : String(18);   // Product hierarchy
    LVORM          : Boolean;      // Deletion Indicator
    MTPOS          : String(4);    // Item Category Group for Material Master
    VERSG          : String(1);    // Material statistics group
    KTGRM          : String(2);    // Account Assignment Group for Material
}

type t_Sales_tax {
    VKORG_Material_MATNR : String(40);   // Material Number
    VKORG_VKORG          : String(4);    // Sales Organization
    VKORG_VTWEG          : String(2);    // Distribution Channel
    Country              : String(2);    // Country
    TaxCategory          : String(4);    // Tax Category
    TaxClassification    : String(1);    // Tax Classification
}

type t_Valuation {
    Material_MATNR       : String(40);   // Material Number
    BWKEY                : String(4);    // Valuation Area
    BWTAR                : String(10);   // Valuation Type
    STPRS                : Decimal(13, 3); // Standard Price
    BWTTY                : String(1);    // Valuation Category
    BKLAS                : String(4);    // Valuation Class
    CURRENCY_KEY         : String(4);    // Currency key
    CURTP                : String(2);    // Currency Type and Valuation View
    VERPR                : Decimal(11, 2); // Moving Average Price/Periodic Unit Price
    VPRSV                : String(1);    // Price control indicator
    PEINH                : Decimal(5, 3); // PriceUnitQty - Price Unit
    WAERS                : String(3);    // Currency - Currency Key
    MLAST                : String(1);    // InventoryValuationProcedure - Value Updating
    KALN1                : String(12);   // ProdCostEstNumber - Costing Number for Cost Estimate with Qty Structure
    LVORM                : Boolean;      // IsMarkedForDeletion - Deletion Flag
    ZKPRS                : Decimal(11, 3); // FuturePrice - Future Price
    ZKDAT                : Date;         // FuturePriceValidityStartDate - Date from which future price is valid
    PPRDZ                : Date;         // PlannedPrice - Planned Price Date
    EKALR                : String(1);    // IsMaterialCostedWithQtyStruc - Costed with Quantity Structure
    SPERW                : Boolean;      // FutureEvaluatedAmountValue - Inventory Blockage Value
}

type ErrorList { message: String; } 

type ValidationError { matnr: String;
 errors: many ErrorList; }

type FieldStatus {
    Table    : String;
    Field    : String;
    Required : Boolean;
    Visble   : Boolean;
    Editable : Boolean;
}

type changeRequestCount {
  number : Integer
}

type tyReplicationResult {

  MATNR     : String(40);
  JobID : String(50);
  STATUS :  String(15);
  REPLICATION_MODE  : String(15);
  REQUEST_NUMBER : Integer;
  Message       : String(500);
  Timestamp          : Timestamp;
  REPLICATED_BY : String;
}
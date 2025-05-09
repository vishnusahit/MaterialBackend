namespace mdg;

using {
    cuid,
    managed,
    sap.common.CodeList
} from '@sap/cds/common';


entity Mara_staging : cuid, managed {
        @mandatory
    key MATNR             : String(40); // Material Number
        MAKT_MAKTX        : String(100); // Material Description
        BISMT             : String(40); // Old Material Number
        LVORM             : Boolean; // Deletion Indicator
        MATKL             : String(9); // Material Group

        @mandatory
        MBRSH             : String(1) default 'M'; // Industry Sector
        MEINS             : String(3);
        MSTAE             : String(2); // Cross-Plant Material Status
        MSTDE             : Date; // Date from which the Cross-Plant Material Status is Valid

        MTART             : String(4);
        SPART             : String(2); // Division
        EXTWG             : String(18); // External Material Group
        MAGRV             : String(4); // Material Group: Packaging Materials
        MTPOS_MARA        : String(4); // General Item Category Group
        PRDHA             : String(18); // Product Hierarchy
        WRKST             : String(48); // Basic Material
        EAN11             : String(18); // International Article Number (EAN/UPC)
        VOLEH             : String(3); // Volume Unit
        VOLUM             : Decimal(13, 3); // Volume
        LAENG             : Integer;
        BREIT             : Integer;
        HOEHE             : Integer;
        CUOBF             : Integer;
        NTGEW             : Decimal(13, 3); //Net Weight
        GEWEI             : String(3) default 'KG'; //Weight Unit
        BRGEW             : Decimal(13, 3); //Gross Wight
        MEABM             : String(3) default 'M'; //UNit of length/width/height
        SLED_BBD          : String(1); //Expiration Date
        MHDHB             : String(4); //Total Shelf Life
        RAUBE             : String(2); //Storage conditions
        MHDRZ             : String(4); //Minimum Remaining Shelf Life
        IPRKZ             : String(1); //Period Indicator for Shelf Life Expiration Date
        TRAGR             : String(4); //Transportation Group
        EKWSL             : String(4); //Purchasing Value Key
        QMPUR             : Boolean; //QM in Procurement Is Active
        Status            : String(10); //Active or InActive
        Request_Desc      : String;
        plant             : Composition of many Plant
                                on plant.mat_plant = $self;
        to_sales_delivery : Composition of many Sales_Delivery
                                on to_sales_delivery.Material = $self;
        to_valuation      : Composition of many Valuation
                                on to_valuation.Material = $self;
        to_Description    : Composition of many Description
                                on to_Description.Material = $self;
        to_Warehouse      : Composition of many Warehouse
                                on to_Warehouse.Material = $self;
        to_Alternate_UOM  : Composition of many Alternate_UOM
                                on to_Alternate_UOM.Material = $self;
}

entity Warehouse {
        @UI.Hidden
    key Material        : Association to Mara_staging; // Material Number
    key LGNUM           : String(3); // Warehouse Number / Warehouse Complex
        LVORM           : Boolean; // Deletion flag for all material data of a warehouse number
        LGBKZ           : String(3); // Storage Section Indicators
        LTKZE           : String(3); // Storage type indicator for stock placement
        LTKZA           : String(3); // Storage type indicator for stock removal

        LHMG1           : Decimal(13, 3); // Loading equipment quantity 1
        LHMG2           : Decimal(13, 3); // Loading equipment quantity 2
        LHMG3           : Decimal(13, 3); // Loading equipment quantity 3

        LHME1           : String(3); // Unit of measure for loading equipment quantity 1
        LHME2           : String(3); // Unit of measure for loading equipment quantity 2
        LHME3           : String(3); // Unit of measure for loading equipment quantity 3

        LETY1           : String(3); // 1st storage unit type
        LETY2           : String(3); // 2nd storage unit type
        LETY3           : String(3); // 3rd storage unit type

        LVSME           : String(3); // Warehouse Management Unit of Measure
        KZZUL           : Boolean; // Indicator: Allow addition to existing stock
        BLOCK           : String(2); // Bulk Storage Indicators
        KZMBF           : Boolean; // Indicator: Message to inventory management
        BSSKZ           : Boolean; // Special movement indicator for warehouse management

        MKAPV           : Decimal(11, 3); // Capacity usage
        BEZME           : String(3); // Unit of measure for capacity consumption
        PLKPT           : String(3); // Picking storage type for rough-cut and detailed planning
        VOMEM           : String(1); // Default for unit of measure from material master record
        L2SKR           : String(1); // Material relevance for 2-step picking
        to_Storage_type : Composition of many Storage_type
                              on to_Storage_type.Warehouse = $self
}

entity Storage_type {
        @UI.Hidden
    key Warehouse : Association to Warehouse; // Material Number
    key LGTYP    : String(3); // Storage Type

        LVORM    : Boolean; // Deletion flag for all material data of a storage type
        LGPLA    : String(10); // Storage Bin
        LPMAX    : Decimal(13, 3); // Maximum storage bin quantity
        LPMIN    : Decimal(13, 3); // Minimum storage bin quantity
        MAMNG    : Decimal(13, 3); // Control quantity
        NSMNG    : Decimal(13, 3); // Replenishment quantity
        KOBER    : String(3); // Picking Area
}

entity Alternate_UOM {
        @UI.Hidden
    key Material : Association to Mara_staging; // Material Number
    key MEINH    : String(3); // Alternative Unit of Measure for Stockkeeping Unit

        UMREZ    : Decimal(5, 0); // Numerator for Conversion to Base Units of Measure
        UMREN    : Decimal(5, 0); // Denominator for conversion to base units of measure
        EANNR    : String(13); // International Article Number (EAN/UPC)
        EAN11    : String(18); // Category of International Article Number (EAN)
        NUMTP    : String(2); // European Article Number (EAN) - obsolete!!!!!
        LAENG    : Decimal(13, 3); // Length
        BREIT    : Decimal(13, 3); // Width
        HOEHE    : Decimal(13, 3); // Height
        MEABM    : String(3); // Unit of Dimension for Length/Width/Height
        VOLUM    : Decimal(13, 3); // Volume
        VOLEH    : String(3); // Volume Unit
        BRGEW    : Decimal(13, 3); // Gross Weight
        GEWEI    : String(3); // Unit of Weight
}

entity Description {
        @UI.Hidden
    key Material    : Association to Mara_staging;

        @title: 'Language Code'
    key code        : String(4);
        Description : String;

}

entity Plant {
        @UI.Hidden
    key mat_plant           : Association to Mara_staging;

        @mandatory
    key WERKS               : String(4);
        MMSTA               : String(2); //Plant-Specific Material Status
        PRCTR               : String(10);
        XCHPF_marc          : Boolean; //Batch Management Requirement Indicator

        @mandatory
        DISMM               : String(2); //MRP Type
        MAABC               : String(1); //ABC Indicator
        DISPO               : String(3); //MRP Controller
        BESKZ               : String(1); //Procurement Type
        EKGRP               : String(3); //Purchasing Group
        LVORM               : Boolean; // Deletion Indicator
        FIXLS               : Decimal(13, 3); //Fixed lot size for Supply Demand Match
        //SCM_GRPRT:Integer;//Goods Receipt Processing Time
        LADGR               : String(4); //Loading Group
        MTVFP               : String(2); //Checking Group for availaility check
        DGRMRPPP            : String; //Material Requirements Planning (MRP) Group
        RDPRF               : String(4); //Rounding Profile
        DISLS               : String(2); //Lot Sizing Procedure within Materials Planning
        BSTFE               : Decimal(13, 3); //Fixed Lot Size
        SCM_GRPRT           : String; //Goods Reciept Processing time -- need to checked
        BSTMA               : Decimal(13, 3); //Maximum lot size
        BSTMI               : Decimal(13, 3); //Minimum lot size
        BEARZ               : Decimal(5, 2); //processing Time
        HERKL               : String(3); //Country of Origin of Material (Non-Preferential Origin)
        to_Storage_Location : Composition of many Storage_Location
                                  on to_Storage_Location.plant = $self;
}

entity Storage_Location {
        @UI.Hidden
    key plant : Association to Plant;

        @mandatory
    key LGORT : String(4); //Storage Location
        LGPBE : String; //Storage Bin
}

entity Sales_Delivery {
        @UI.Hidden
    key Material     : Association to Mara_staging;

        @title: 'Sales Organization'
    key VKORG        : String(4); //Sales Organization
        RDPRF        : String(4); //Rounding Profile
        PRODH        : String(18); //Product hierarchy
        LVORM        : Boolean; // Deletion Indicator
        MTPOS        : String(4); //Item Category Group for Material Master
        VERSG        : String(1); // Material statistics group
        KTGRM        : String(2); // Account Assignment Group for Material

        @title: 'Distribution Channel'
    key VTWEG        : String(2); //Distribution Channel
        to_Sales_tax : Composition of many Sales_tax
                           on to_Sales_tax.VKORG = $self;
}

entity Sales_tax {
        @UI.Hidden
    key VKORG             : Association to Sales_Delivery; // Material Number
    key Country           : String(2); // Country
        TaxCategory       : String(4); // Tax Category
        TaxClassification : String(1); // Tax Classification
}

entity Valuation {
        @UI.Hidden
    key Material     : Association to Mara_staging;

        @title: 'Valuation Area'
    key BWKEY        : String(4); // Valuation Area
        STPRS        : Decimal(13, 3); // Standard Price

        @title: 'Valuation Type'
    key BWTAR        : String(10); //Valuation Type
        BWTTY        : String(1); //Valuation Category
        BKLAS        : String(4); //Valuation Class
        CURRENCY_KEY : String(4); // Currency key
        CURTP        : String(2); //Currency Type and Valuation View
        VERPR        : Decimal(11, 2); //Moving Average Price/Periodic Unit Price
        VPRSV        : String(1); //Price control indicator

        // --- Additional fields---

        PEINH        : Decimal(5, 3); // PriceUnitQty - Price Unit
        WAERS        : String(3); // Currency - Currency Key
        MLAST        : String(1); // InventoryValuationProcedure - Value Updating
        KALN1        : String(12); // ProdCostEstNumber - Costing Number for Cost Estimate with Qty Structure
        LVORM        : Boolean; // IsMarkedForDeletion - Deletion Flag
        ZKPRS        : Decimal(11, 3); // FuturePrice - Future Price
        ZKDAT        : Date; // FuturePriceValidityStartDate - Date from which future price is valid
        PPRDZ        : Date; // PlannedPrice - Planned Price Date
        EKALR        : String(1); // IsMaterialCostedWithQtyStruc - Costed with Quantity Structure
        SPERW        : Boolean; // FutureEvaluatedAmountValue - Inventory Blockage Value
}


entity CAPM_Field_Mapping {
    key Table             : String;
    key Field_Name        : String;
        SAP_Table         : String;
        SAP_Field_Name    : String;
        Field_Description : String;
}


context REQUEST_NUMBER {

    entity Change_Request {
        key REQUEST_NUMBER     : Integer;
            InstanceID         : String;
            REQUEST_TYPE       : String;
            Overall_status     : String;
            Model              : String;
            Requested_By       : String;
            Requested_Date     : Date;
            Requested_Time     : Time;
            Requested_on       : String;
            Approved_By        : String;
            Aprroved_date      : Date;
            Aprroved_Time      : Time;
            Completed_On       : String;
            Description        : String;
            Notes              : String;
            Replication_status : String;
            Details            : Composition of many Change_Request_details
                                     on Details.Change = $self;
            to_Action_Details  : Composition of many Change_Request_User_Actions_Details
                                     on to_Action_Details.Change = $self;
    }

    entity Change_Request_details {
        key Change              : Association to Change_Request;
        key Object_ID           : String(40);
            Description         : String;
            Object_CUID         : String;
            Replication_status  : String;
            Overall_status      : String;
            Material_type       : String(4);
            to_Change_Documents : Composition of many Change_Documents
                                      on to_Change_Documents.Request_details = $self;
    }

    entity Change_Documents {
        key Request_details    : Association to Change_Request_details;
        key Table              : String;
        key Field_Name         : String;
            Old_Value          : String;
            New_Value          : String;
            Processor          : String;
            timestamp          : String;
            Object_Description : String;
    }

    entity Change_Request_User_Actions_Details {
        key Change     : Association to Change_Request;
        key User_Step  : String;
            Processer  : String;
            Action     : String;
            Time_Stamp : String;
    }

}

context Value_help {
    entity Fixed_Values : managed {
            @title: 'Type'
        key Type             : String;
            Description      : String;
            to_value_list    : Composition of many Value_List
                                   on to_value_list.Fixed = $self;
            to_field_mapping : Composition of many Field_Mapping
                                   on to_field_mapping.Fixed = $self;
    }

    entity Value_List : managed {
            @title: 'Value'
        key Value       : String;
            Description : String;

            @UI.Hidden
        key Fixed       : Association to Fixed_Values;
    }

    entity Field_Mapping : managed {
            @title: 'Table Name'
        key Table_Name  : String;

            @title: 'Field Name'
        key Field_Name  : String;

            @UI.Hidden
        key Fixed       : Association to Fixed_Values;
            Description : String;
    }

}

context Change_tracking {
    entity ChangeLog : managed {
        key id         : UUID;
            operation  : String(10); // 'CREATE', 'UPDATE', 'DELETE'
            entityName : String(255); // Name of the changed entity
            entityKey  : String(4000); // String representation of the entity's key(s)
            changedAt  : String; // Timestamp of the change
            changedBy  : String(255); // User who made the change
            fieldName  : String(255); // Name of the changed field
            oldValue   : LargeString; // Previous value
            newValue   : LargeString; // New value
            notes      : String;
            parentKey  : String;
    }
}


context Field_Properties {
    entity ModelHeader : managed {
        key modelName   : String;
            description : String;
            entityItem  : Composition of many EntityItems
                              on entityItem.modelHeader = $self;
    }

    entity EntityItems : managed {
        key entity        : String;
            description   : String;
            parent_entity : String;
            child_element : String;
            child_entity  : String;


            fieldAtribute : Composition of many FieldAtribute
                                on fieldAtribute.entityItems = $self;
            modelHeader   : Association to one ModelHeader;


    }

    entity FieldAtribute : managed {
        key fieldName   : String;
            description : String;
            isVisible   : Boolean;
            isEditable  : Boolean;
            isMandatory : Boolean;
            entityItems : Association to one EntityItems;
    }
}

context Rules {
    entity RuleHeader : cuid, managed {
        model             : String(15);
        ruleType          : String;
        tableEntity       : String;
        tableEntityDesc   : String;
        targetField       : String;
        targetFieldDesc   : String;
        onChangeField     : String;
        onChangeFieldDesc : String;
        isMandatory       : Boolean;
        ruleLineItem      : Composition of many RuleLineItems
                                on ruleLineItem.ruleHeader = $self;
    }


    entity RuleLineItems : cuid, managed {
        ruleID               : String(15);
        modelTable           : String;
        modelTableDesc       : String;
        modelTableField      : String;
        modelTableFieldDesc  : String;
        operator             : String;
        modelTableFieldValue : String;
        defaultValue         : String;
        errorMessage         : String;
        ruleHeader           : Association to one RuleHeader;
    }

}

context Duplicate_Check {
    entity Duplicate_Check_Fields : cuid {
        Model      : String;
        Field_Name : String(32);
        Weightage  : Integer;
    }
}

entity Material_Number_Range {
    key Material_type  : String(4);
    key Int_Ext        : String;
        From_Number    : Integer;
        TO_Number      : Integer;
        Current_Number : Integer;
}

entity Dummy_Number_Range {
    key Model          : String(32);
        Current_Number : Integer;
        Prefix         : String(32);
}

context Dummy {
    entity Mara_staging_dummy : cuid, managed {
        key MATNR             : String(40); // Material Number
            MAKT_MAKTX        : String(100); // Material Description
            BISMT             : String(40); // Old Material Number
            LVORM             : Boolean; // Deletion Indicator
            MATKL             : String(9); // Material Group
            MBRSH             : String(1); // Industry Sector
            MEINS             : String(3); // Base Unit of Measure
            MSTAE             : String(2); // Cross-Plant Material Status
            MSTDE             : Date; // Date from which the Cross-Plant Material Status is Valid
            MTART             : String(4); // Material Type
            SPART             : String(2); // Division
            EXTWG             : String(18); // External Material Group
            MAGRV             : String(4); // Material Group: Packaging Materials
            MTPOS_MARA        : String(4); // General Item Category Group
            PRDHA             : String(18); // Product Hierarchy
            WRKST             : String(48); // Basic Material
            EAN11             : String(18); // International Article Number (EAN/UPC)
            VOLEH             : String(3);
            VOLUM             : Decimal(13, 3); // Volume
            LAENG             : Integer;
            BREIT             : Integer;
            HOEHE             : Integer;
            CUOBF             : Integer;
            NTGEW             : Decimal(13, 3); //Net Weight
            GEWEI             : String(3); //Weight Unit
            BRGEW             : Decimal(13, 3); //Gross Wight
            MEABM             : String(3); //UNit of length/width/height
            SLED_BBD          : String(1); //Expiration Date
            MHDHB             : String(4); //Total Shelf Life
            RAUBE             : String(2); //Storage conditions
            MHDRZ             : String(4); //Minimum Remaining Shelf Life
            IPRKZ             : String(1); //Period Indicator for Shelf Life Expiration Date
            TRAGR             : String(4); //Transportation Group
            EKWSL             : String(4); //Purchasing Value Key
            QMPUR             : Boolean; //QM in Procurement Is Active
            REQUEST_NUMBER    : Integer;
            MAX_NO            : Integer;
            CREATION_TYPE     : String;
            Status            : String(10);
            Request_Desc      : String;
            plant             : Composition of many Plant_dummy
                                    on plant.mat_plant = $self;
            to_sales_delivery : Composition of many Sales_Delivery_dummy
                                    on to_sales_delivery.Material = $self;
            to_valuation      : Composition of many Valuation_dummy
                                    on to_valuation.Material = $self;
            to_Description    : Composition of many Description_dummy
                                    on to_Description.Material = $self;
    }

    entity Plant_dummy {
        key mat_plant           : Association to Mara_staging_dummy;
        key WERKS               : String(4);
            MMSTA               : String(2); //Plant-Specific Material Status
            PRCTR               : String(10);
            XCHPF_marc          : Boolean; //Batch Management Requirement Indicator
            DISMM               : String(2); //MRP Type
            MAABC               : String(1); //ABC Indicator
            DISPO               : String(3); //MRP Controller
            BESKZ               : String(1); //Procurement Type
            EKGRP               : String(3); //Purchasing Group
            LVORM               : Boolean; // Deletion Indicator
            FIXLS               : Decimal(13, 3); //Fixed lot size for Supply Demand Match
            LADGR               : String(4); //Loading Group
            MTVFP               : String(2); //Checking Group for availaility check
            DGRMRPPP            : String; //Material Requirements Planning (MRP) Group
            RDPRF               : String(4); //Rounding Profile
            DISLS               : String(2); //Lot Sizing Procedure within Materials Planning
            BSTFE               : Decimal(13, 3); //Fixed Lot Size
            SCM_GRPRT           : String; //Goods Reciept Processing time -- need to checked
            BSTMA               : Decimal(13, 3); //Maximum lot size
            BSTMI               : Decimal(13, 3); //Minimum lot size
            BEARZ               : Decimal(5, 2); //processing Time
            HERKL               : String(3); //Country of Origin of Material (Non-Preferential Origin)
            to_Storage_Location : Composition of many Storage_Location_dummy
                                      on to_Storage_Location.plant = $self;
    }

    entity Storage_Location_dummy {
        key plant : Association to Plant_dummy;
        key LGORT : String(4); //Storage Location
            LGPBE : String; //Storage Bin
    }

    entity Description_dummy {
        key Material    : Association to Mara_staging_dummy;
        key code        : String(4);
            Description : String;
    }

    entity Sales_Delivery_dummy {
        key Material : Association to Mara_staging_dummy;
        key VKORG    : String(4); //Sales Organization
            RDPRF    : String(4); //Rounding Profile
            PRODH    : String(18); //Product hierarchy
            LVORM    : Boolean; // Deletion Indicator
            MTPOS    : String(4); //Item Category Group for Material Master
        key VTWEG    : String(2); //Distribution Channel
    }

    entity Valuation_dummy {
        key Material     : Association to Mara_staging_dummy;
        key BWKEY        : String(4); // Valuation Area
            STPRS        : Decimal(13, 3); // Standard Price
        key BWTAR        : String(10); //Valuation Type
            BWTTY        : String(1); //Valuation Category
            BKLAS        : String(4); //Valuation Class
            CURRENCY_KEY : String(4); // Currency key
            CURTP        : String(2); //Currency Type and Valuation View
            VERPR        : Decimal(11, 2); //Moving Average Price/Periodic Unit Price
            VPRSV        : String(1); //Price control indicator
    }

}

entity ExcelUpload {
    @Core.MediaType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    excel : LargeBinary;
};

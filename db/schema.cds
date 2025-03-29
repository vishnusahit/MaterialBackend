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
        key Material : Association to Mara_staging;

            @title: 'Sales Organization'
        key VKORG    : String(4); //Sales Organization
            RDPRF    : String(4); //Rounding Profile
            PRODH    : String(18); //Product hierarchy
            LVORM    : Boolean; // Deletion Indicator
            MTPOS    : String(4); //Item Category Group for Material Master

            @title: 'Distribution Channel'
        key VTWEG    : String(2); //Distribution Channel
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
            Description : String;
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
            Overall_status     : String;
            Material_type     : String(4);
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
        model         : String(15);
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

entity Material_Number_Range{
    key Material_type : String(4);
    key Int_Ext : String;
    From_Number: Integer;
    TO_Number: Integer;
    Current_Number:Integer;
}
entity Dummy_Number_Range{
    key Model : String(32);
    Current_Number : Integer;
    Prefix : String(32);
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

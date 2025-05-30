using { mdg as db } from '../db/schema';
using { mdg.commons as common } from '../db/commons';
using {ZSRV_LITEMDG_VALUEHELP_API_SRV as API} from './external/ZSRV_LITEMDG_VALUEHELP_API_SRV';

service litemdg {    
    @odata.draft.enabled
    //@Common.DraftRoot.NewAction: 'litemdg.createDraft'
    entity Mara as projection on db.Mara_staging actions{
         action calculation();
         action createDraft(in: many $self) returns Mara; 
    }; 
    entity mara_dummy as projection on db.Dummy.Mara_staging_dummy;
    entity Plant_dummy as projection on db.Dummy.Plant_dummy;
    entity Storage_dummy as projection on db.Dummy.Storage_Location_dummy;
    entity Description_dummy as projection on db.Dummy.Description_dummy;

    entity RulesHeader as projection on db.Rules.RuleHeader;
    entity RuleLineItems as projection on db.Rules.RuleLineItems;
    @odata.singleton
    entity ExcelUpload as projection on db.ExcelUpload;
    entity plant as projection on db.Plant; 
    entity Description as projection on db.Description;
    entity Change_Request as projection on db.REQUEST_NUMBER.Change_Request;
    entity Storage_Location as projection on db.Storage_Location;
    entity Sales_Delivery as projection on db.Sales_Delivery;
    entity Warehouse as projection on db.Warehouse;
    entity Storage_type as projection on db.Storage_type;
    entity Sales_tax as projection on db.Sales_tax;
    entity Alternate_UOM as projection on db.Alternate_UOM;
    entity Sales_dummy as projection on db.Dummy.Sales_Delivery_dummy;
    entity Valuation as projection on db.Valuation;
    entity Valuation_dummy as projection on db.Dummy.Valuation_dummy;
    entity Change_Request_Details as projection on db.REQUEST_NUMBER.Change_Request_details;
    
    @odata.draft.enabled
    entity Fixed_Values as projection on db.Value_help.Fixed_Values;
    entity Value_List as projection on db.Value_help.Value_List;
    entity Field_Mapping as projection on db.Value_help.Field_Mapping;
    @odata.draft.enabled
    entity ModelHeaderSet as projection on db.Field_Properties.ModelHeader;
    entity EntityItems as projection on db.Field_Properties.EntityItems;
    entity FieldAtribute as projection on db.Field_Properties.FieldAtribute;

    entity ChangeLog as projection on db.Change_tracking.ChangeLog;
   

    entity Value_ListAPI as projection on API.ValueHelpSet;
    @odata.draft.enabled
    entity ApproverMatrix as projection on db.ApproverMatrix;

    action ProcessExcel(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description,ip_type: String,ip_Entity: String) returns String;
    action Uplod_to_Dummy(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns String;
    action Validate(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description,ip_type: String,ip_Entity: String) returns many common.ValidationError;
    action Trigger_workflow(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns Integer;
    action SaveToDB(ip_req_no: Integer,ip_type: String,ip_Entity: String) returns String;
    action FieldStatus(ip_type: String) returns many common.FieldStatus;
    action InsertMaterial(ip_MaterialID:String,ip_NewMaterial:String) returns String;
    function Rule_validation(ip_ID:String) returns many String;
    action Mass_Rule_validation(ip_ID:many String)  returns many common.ValidationError;

     // Action to get count of open change requests for current user
    function getOpenChangeRequestCount() returns common.changeRequestCount; //: Anupam
    function getInboxPendingRequestcount() returns common.changeRequestCount;

    action get_ValueList(Key:String) returns String;


  //entity Exposed for Dashboard
  entity RequestStats           as
    select from Change_Request {
      key REQUEST_NUMBER,
          REQUEST_TYPE,
          Overall_status,
          Requested_Date,
          Aprroved_date,
          Requested_By,
          count( * ) as requestCount : Integer
    }
    group by
      REQUEST_NUMBER,
      REQUEST_TYPE,
      Overall_status,
      Requested_Date,
      Aprroved_date,
      Requested_By;

  // entity ObjectStats @(cds.redirection.target: 'Change_Request_Details') as  select from Change_Request_Details
  //     {
  //       key Change,
  //       key Object_ID,
  //       Material_type,
  //       Overall_status,
  //       count(*) as ObjectStatsCount : Integer
  //     }
  //     group by
  //       Change,
  //       Object_ID,
  //       Material_type,
  //       Overall_status;
  // other fields

  entity ObjectStats            as
    select from Change_Request_Details {
      key Change.REQUEST_NUMBER,
      key Object_ID,
          Material_type,
          Overall_status,
          count( * ) as ObjectStatsCount : Integer
    }
    group by
      Change.REQUEST_NUMBER,
      Object_ID,
      Material_type,
      Overall_status;

  entity MaraStagType           as
    select from Mara {
      key ID,
      key MATNR,
          MTART,
          count( * ) as maraTypeCount : Integer
    }
    group by
      ID,
      MATNR,
      MTART;


  entity MaraType               as
    select from Mara {

      MATNR,
      MTART,
      count( * ) as maraTypeCount : Integer
    }
    group by

      MATNR,
      MTART;
}


annotate litemdg.MaraType with {
  @Analytics.Dimension: true
  MTART;

  @Analytics.Measure  : true
  @Aggregation.default: #COUNTDISTINCT
  @Core.Computed
  maraTypeCount @title: 'Counts';

};

annotate litemdg.MaraStagType with {
  @Analytics.Dimension: true
  MTART;

  @Analytics.Measure  : true
  @Aggregation.default: #COUNTDISTINCT
  @Core.Computed
  maraTypeCount @title: 'Counts';

};

annotate litemdg.RequestStats with {
  @Analytics.Dimension: true
  REQUEST_TYPE;

  @Analytics.Measure  : true
  @Aggregation.default: #COUNTDISTINCT
  @Core.Computed
  requestCount @title: 'Counts';

};

annotate litemdg.ObjectStats with {
  @Analytics.Dimension: true
  Material_type;

  @Analytics.Measure  : true
  @Aggregation.default: #COUNTDISTINCT
  @Core.Computed
  ObjectStatsCount @title: 'Counts';

};
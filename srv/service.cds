using { mdg as db } from '../db/schema';
using { mdg.commons as common } from '../db/commons';


service litemdg {    
    @odata.draft.enabled
    //@Common.DraftRoot.NewAction: 'litemdg.createDraft'
    entity Mara as projection on db.Mara_staging actions{
         action calculation();
         action createDraft(in: many $self) returns Mara; 
    }; 
    entity mara_dummy as projection on db.Mara_staging_dummy;
    entity Plant_dummy as projection on db.Plant_dummy;
    entity Storage_dummy as projection on db.Storage_Location_dummy;
    entity Description_dummy as projection on db.Description_dummy;
    entity Rules as projection on db.Rule_Framework;
    entity Rules_validation as projection on db.Rule_Framework_error;
    entity Value_help as projection on db.Value_help;
    @odata.singleton
    entity ExcelUpload as projection on db.ExcelUpload;
    entity plant as projection on db.Plant; 
    entity Description as projection on db.Description;
    entity Change_Request as projection on db.Change_Request;
    entity Storage_Location as projection on db.Storage_Location;
    entity Sales_Delivery as projection on db.Sales_Delivery;
    entity Sales_dummy as projection on db.Sales_Delivery_dummy;
    entity Valuation as projection on db.Valuation;
    entity Valuation_dummy as projection on db.Valuation_dummy;
    entity Change_Request_Details as projection on db.Change_Request_details;
    @odata.draft.enabled
    entity Fixed_Values as projection on db.Fixed_Values;
    entity Value_List as projection on db.Value_List;
    entity Field_Mapping as projection on db.Field_Mapping;
    action ProcessExcel(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns String;
    action Uplod_to_Dummy(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns String;
    action Validate(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns many common.ValidationError;
    action Trigger_workflow(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns Integer;
    action SaveTocommon(ip_req_no: Integer) returns String;
    action FieldStatus(ip_type: String) returns many common.FieldStatus;
    action InsertMaterial(ip_MaterialID:String,ip_NewMaterial:String) returns String;
}
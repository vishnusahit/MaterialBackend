using { mdg as db } from '../db/schema';
using { mdg.commons as common } from '../db/commons';


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
    @odata.draft.enabled
    entity RulesHeader as projection on db.Rules.RuleHeader;
    @cds.redirection.target
    entity RuleHeader as projection on db.Rules.RuleHeader;
    entity RuleLineItems as projection on db.Rules.RuleLineItems;
    @odata.singleton
    entity ExcelUpload as projection on db.ExcelUpload;
    entity plant as projection on db.Plant; 
    entity Description as projection on db.Description;
    entity Change_Request as projection on db.REQUEST_NUMBER.Change_Request;
    entity Storage_Location as projection on db.Storage_Location;
    entity Sales_Delivery as projection on db.Sales_Delivery;
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

    action ProcessExcel(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns String;
    action Uplod_to_Dummy(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns String;
    action Validate(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns many common.ValidationError;
    action Trigger_workflow(ip_mara: many common.t_Mara,ip_plant: many common.t_plant,ip_storage:many common.t_Storage_Location,ip_description:many common.t_Description) returns Integer;
    action SaveToDB(ip_req_no: Integer) returns String;
    action FieldStatus(ip_type: String) returns many common.FieldStatus;
    action InsertMaterial(ip_MaterialID:String,ip_NewMaterial:String) returns String;
}
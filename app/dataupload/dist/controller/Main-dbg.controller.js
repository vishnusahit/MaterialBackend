sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "dataupload/lib/xlsx",
    "dataupload/lib/xlsxf",
    "dataupload/lib/jszip",
    "sap/m/Dialog",
    "sap/m/TextArea",
    "sap/m/Label",
    "sap/m/Button",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
],
function (Controller, MessageBox, MessageToast,xlsxjs,XLSXF,jszip,Dialog,TextArea,Label,Button,Fragment,JSONModel) {
    "use strict";
    //  var XLSX = require('xlsx');
    return Controller.extend("dataupload.controller.Main", { 
        // var oUploadDialog;    
        onInit: function () {
          
            // this.oFileUploader = this.byId("uploader");
            // this.oFileUploader = this.getView().byId("idExceluploader");
            // this.oUploadButton = this.getView().byId("idExcelOkBtn");
            // this.oUploadButton = this.byId("ok");
            var oModel = this.getView().getModel("odataV2");
            var draftData = localStorage.getItem("draftData");
             if (draftData) {
                 var jsonData = JSON.parse(draftData);
                 var oModel = new sap.ui.model.json.JSONModel(jsonData);
                 this.getView().setModel(oModel, "ExcelData");
                }
            // this._exDialog = null;
           
        },
        onBeforeOpen: function (oEvent) {
            
            // oUploadDialog = oEvent.getSource();
            // oExtensionAPI.addDependent(oUploadDialog);

            var oDialog = oEvent.getSource();

            // Optional: Reset the FileUploader and any other fields
             var oFileUploader = this.getView().byId("idExceluploader");
            oFileUploader.clear(); // Clear any previously selected files

            // Optional: Set default states for buttons
            // this.getview().byId("idExcelOkBtn").setEnabled(false); 
            this.getView().byId("confirmButton").setEnabled(false); 
            // Disable the OK button initially

            // Optional: Log for debugging
            // console.log("Dialog is about to open.");
        },

        onAfterClose: function (oEvent) {
            // oExtensionAPI.removeDependent(oUploadDialog);
            // oUploadDialog.destroy();
            // oUploadDialog = undefined;

            var oDialog = oEvent.getSource(); // Get the dialog that was closed
            var oFileUploader = this.getView().byId("idExceluploader");
        
            // Clear the file uploader
            oFileUploader.clear();
        
            // Optional: Reset the model if needed
            // this.getView().setModel(new sap.ui.model.json.JSONModel([]), "ExcelData");
        
            // Log to the console for debugging
            // console.log("Dialog closed.");
            oDialog.destroy();

        },

        onFileAllowed: function (oEvent) {
          
            this.getView().byId("confirmButton").setEnabled(true);
            // this.oUploadButton.setEnabled(true);
           
            // this.getView().byId("idExcelOkBtn").setEnabled(true);
            // const aFiles = oEvent.getParameter("files");
            // if (aFiles && aFiles.length > 0) {
            //     const oButton = this.byId("idExcelOkBtn");
            //     oButton.setEnabled(true);
            // }
        },

        onFileEmpty: function (oEvent) {
            
            this.getView().byId("confirmButton").setEnabled(false);
            // this.oUploadButton.setEnabled(false);

            // this.getView().byId("idExcelOkBtn").setEnabled(false);
        },

        onTypeMismatch: function (oEvent) {
          
            var sSupportedFileTypes = oEvent
                .getSource()
                .getFileType()
                .map(function (sFileType) {
                    return "*." + sFileType;
                })
                .join(", ");
            
            MessageBox.error("The file type *." + oEvent.getParameter("fileType") + " is not supported. Choose one of the following types: " + sSupportedFileTypes);
        },

        onUploadComplete: function (oEvent) {
            MessageToast.show("File upload complete");
        },
    
       
        onOk: function (oEvent) {
          
           var oDialog = oEvent.getSource().getParent(); // Get the parent dialog
           // var oFileUploader = oDialog.getContent()[0]; // Access the FileUploader in the dialog
           var oFileUploader = this.getView().byId("idExceluploader");
            var oFile = oFileUploader.oFileUpload.files[0]; // Get the selected file
        
            if (!oFile) {
                MessageToast.show("Please select an Excel file.");
                return;
            }
        
            var reader = new FileReader();
        
            reader.onload = (event) => {
                var data = event.target.result;
                var workbook = XLSX.read(data, { type: "binary" });
        
                var sheetName = workbook.SheetNames[0];
                var sheet = workbook.Sheets[sheetName];
        
                // Convert Excel to JSON
                var jsonData = XLSX.utils.sheet_to_json(sheet);
                var oModel = new sap.ui.model.json.JSONModel(jsonData);
                this.getView().setModel(oModel, "ExcelData");
              
                // Optionally call backend to upload the data
              this.uploadData(jsonData);
              oDialog.close();
              oDialog.destroy();
              this._exDialog=undefined;
            };
        
            reader.onerror = (error) => {
                MessageToast.show("Error reading file: " + error);
            };
        
            reader.readAsBinaryString(oFile);
            
        },
        

        

        uploadData: async function (jsonData) {
          
            // const sUrl = this.getOwnerComponent().getModel("odataV2").sServiceUrl;
            // const oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
            var oModel = this.getView().getModel("odataV2");
            var aPromises = [];

            jsonData.forEach(function (studentData) {
                aPromises.push(new Promise(function (resolve, reject) {
                    // oModel.create("/Material", studentData, {
                    oModel.create("/mara_dummy", studentData, {
                        success: function (oData) {
                            resolve(oData);
                            // oModel.submitChanges({
                            //     success: function () {
                            //         // MessageToast.show("Data saved successfully!");
                            //         oModel.refresh(true);  // Refresh the model to show updated data
                            //     },
                            //     error: function (oError) {
                            //         MessageBox.error("Failed to save changes: " + oError.message);
                            //     }
                            // });
                        },
                        error: function (oError) {
                            console.log(oError);
                            reject(oError);
                        }
                    });
                }));
            });

            // for (const studentData of jsonData) {
            //     await new Promise((resolve, reject) => {
            //         oModel.create("/mara_dummy", studentData, {
            //             success: function (oData) {

            //                 resolve(oData);  // Resolve on success
            //             },
            //             error: function (oError) {
            //                 console.log(oError);
            //                 reject(oError);  // Reject on error
            //             }
            //         });
            //     });
            // }
            // await new Promise((resolve, reject) => {
            //     oModel.submitChanges({
            //         success: function () {
            //             MessageToast.show("Data saved successfully!");
            //             oModel.refresh(true);  // Refresh the model to show updated data
            //             resolve();
            //         },
            //         error: function (oError) {
            //             MessageBox.error("Failed to save changes: " + oError.message);
            //             reject(oError);
            //         }
            //     });
            // });

            Promise.all(aPromises)
                .then(function (results) {
                    MessageToast.show("All data uploaded successfully!");
                    oModel.submitChanges({
                        success: function () {
                            MessageToast.show("Data saved successfully!");
                            oModel.refresh(true);  // Refresh the model to show updated data
                        },
                        error: function (oError) {
                            MessageBox.error("Failed to save changes: " + oError.message);
                        }
                    });
                })
                .catch(function (error) {
                    MessageBox.error("Upload failed: " + error.message);
                });
        },

        
      
        onDelete: function () {
            
            var oTable = this.getView().byId("rulesTable");
            // var aSelectedIndices = oTable.getSelectedIndices();
            var aSelectedIndices = oTable.getSelectedItems();
 
            if (aSelectedIndices.length > 0) {
                var oModel = this.getView().getModel("ExcelData");
                var aData = oModel.getData();
 
                // Delete the selected rows from the data model
                aSelectedIndices.reverse().forEach(function (index) {
                    aData.splice(index, 1);
                });
 
                oModel.setData(aData); // Update model
                oModel.refresh(); // Refresh the table
 
                MessageToast.show("Selected row(s) deleted successfully.");

                aSelectedIndices.forEach(function (item) {
                    item.setSelected(false); // Uncheck each selected item
                });
            } else {
                MessageToast.show("Please select at least one row to delete.");
            }
        },
        onEdit: function () {
           
            var oTable = this.getView().byId("rulesTable");
            // var aSelectedIndices = oTable.getSelectedIndices();
            var aSelectedIndices = oTable.getSelectedItems();
 
            if (aSelectedIndices.length === 1) { // Editing only one row
                var oModel = this.getView().getModel("ExcelData");
                var aData = oModel.getData();
           
                // Get the selected row data
                // var selectedRow = aData[aSelectedIndices[0]];
                var selectedIndex = oTable.indexOfItem(aSelectedIndices[0]);
                // var selectedRow = aData[aSelectedIndices];
                var selectedRow = aData[selectedIndex];
           
                // Open a dialog for editing the row
                var oDialog = new sap.m.Dialog({
                    title: "Edit Rule",
                    content: [
                        new sap.m.Label({ text: "Table Name", labelFor: "tableName" }),
                        new sap.m.Input("tableName", { value: selectedRow.Table_name, width: "100%" }),
           
                        new sap.m.Label({ text: "Column Name", labelFor: "columnName" }),
                        new sap.m.Input("columnName", { value: selectedRow.Column_name, width: "100%" }),
           
                        new sap.m.Label({ text: "Column Description", labelFor: "columnDescription" }),
                        new sap.m.Input("columnDescription", { value: selectedRow.Column_description, width: "100%" }),
           
                        new sap.m.Label({ text: "Business Rule Name", labelFor: "businessRuleName" }),
                        new sap.m.Input("businessRuleName", { value: selectedRow.Business_rule_name, width: "100%" }),
           
                        new sap.m.Label({ text: "Rule Type", labelFor: "ruleType" }),
                        new sap.m.Input("ruleType", { value: selectedRow.Rule_type, width: "100%" }),
           
                        new sap.m.Label({ text: "Rule Definition", labelFor: "ruleDefinition" }),
                        new sap.m.TextArea("ruleDefinition", { value: selectedRow.Rule_Definition, width: "100%", rows: 4 })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Save",
                        press: function () {
                            // Get the updated values from the inputs
                            var newTableName = sap.ui.getCore().byId("tableName").getValue();
                            var newColumnName = sap.ui.getCore().byId("columnName").getValue();
                            var newColumnDescription = sap.ui.getCore().byId("columnDescription").getValue();
                            var newBusinessRuleName = sap.ui.getCore().byId("businessRuleName").getValue();
                            var newRuleType = sap.ui.getCore().byId("ruleType").getValue();
                            var newRuleDefinition = sap.ui.getCore().byId("ruleDefinition").getValue();
           
                            // Update the selected row with the new values
                            // aData[aSelectedIndices[0]].Table_name = newTableName;
                            // aData[aSelectedIndices[0]].Column_name = newColumnName;
                            // aData[aSelectedIndices[0]].Column_description = newColumnDescription;
                            // aData[aSelectedIndices[0]].Business_rule_name = newBusinessRuleName;
                            // aData[aSelectedIndices[0]].Rule_type = newRuleType;
                            // aData[aSelectedIndices[0]].Rule_Definition = newRuleDefinition;

                            aData[selectedIndex].Table_name = newTableName;
                            aData[selectedIndex].Column_name = newColumnName;
                            aData[selectedIndex].Column_description = newColumnDescription;
                            aData[selectedIndex].Business_rule_name = newBusinessRuleName;
                            aData[selectedIndex].Rule_type = newRuleType;
                            aData[selectedIndex].Rule_Definition = newRuleDefinition;
           
                            // Update model with new data
                            oModel.setData(aData);
                            oModel.refresh(); // Refresh the table
                            oTable.getItems()[selectedIndex].setSelected(false);
                            sap.m.MessageToast.show("Rule updated successfully.");
                            oDialog.close();
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            oDialog.close();
                        }
                    }),
                    afterClose: function () {
                        oDialog.destroy();
                    }
                });
           
                this.getView().addDependent(oDialog);
                oDialog.open();
            } else {
                sap.m.MessageToast.show("Please select exactly one row to edit.");
            }
        },
       

      
        onExcelUploadBtnPress: function () {
            
            if (!this._exDialog) {
                this._exDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "dataupload.view.fragments.uploadExcel",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this._exDialog.then(function (oDialog) {
                    oDialog.open();
                });
            }
        },
        
      
        
        onCancel: function (oEvent) {
            
            var oDialog = oEvent.getSource().getParent();
            oDialog.close();
            oDialog.destroy();
            this._exDialog=undefined;
        },
        onDownloadTemplate: function () {
            var templateData = [
                { Table_name: "", Column_name: "", Column_description: "", Business_rule_name: "", Rule_type: "", Rule_Definition: "" }
                // { Table_name: "", Column_name: "", Column_description: "", Business_rule_name: ""}
            ];

            var worksheet = XLSX.utils.json_to_sheet(templateData);
            var workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Template");  
            var fileName = 'template.xlsx';
            XLSX.writeFile(workbook, fileName);

            MessageToast.show("Template downloaded successfully!");
        },
     
         
        onBeforeOpenDuplicates: function (oEvent) {
            var oDialog = oEvent.getSource();
    
            // Optional: Reset the model or table state if necessary
            var oModel = this.getView().getModel("duplicatesModel");
            if (oModel) {
                oModel.refresh(); // Refresh the model before opening
            }   
        },
    
        onAfterCloseDuplicates: function (oEvent) {
                oExtensionAPI.removeDependent(oUploadDialog);
                oUploadDialog.destroy();
                oUploadDialog = undefined;
        },

        onCancelDuplicates: function (oEvent) {
            var oDialog = oEvent.getSource().getParent();
    
            // Close and destroy the dialog
            oDialog.close();
            oDialog.destroy();
           
        },

        closeDialog: function(){
            oUploadDialog && oUploadDialog.close()
        },

       
       
        onCreate : function(){
            // Clear draft
        //     var oModel = this.getView().getModel("ExcelData");
        //     var jsonData = oModel.getData();
        //    this.uploadData(jsonData);
        //    var draftData = localStorage.getItem("draftData");
        //    if(draftData){
        //    localStorage.removeItem("draftData");
        //    sap.m.MessageToast.show("Draft cleared!");
        //    }
        //    // var oModel = this.getView().getModel("ExcelData");
        //    // oModel.setData([]);             
        //    oModel.refresh(true); 
           var oParameters;
           var oModel = new JSONModel();
            var sUrl = "https://py_mdg_duplicate_chk.cfapps.us10-001.hana.ondemand.com/result";
            $.ajax({
                url: sUrl,
                method: "GET",
                dataType: "json",
                contentType: 'application/json',
                data: oParameters,
                success: function (oData) {
                    // Hide busy indicator
                    sap.ui.core.BusyIndicator.hide();
                    // Set the data to the model
                    console.log("Data received: ", oData);
                    oModel.setData(oData);
                    //sap.ui.getCore().byId("uploadDialog").setModel(oModel, "duplicatesModel");
                    // Optionally show a success message
                    MessageToast.show("Data loaded successfully.");
                },
                error: function (oError) {
                    // Hide busy indicator
                    sap.ui.core.BusyIndicator.hide();

                    // Optionally show an error message
                    MessageToast.show("Failed to load data from the Python service.");
                }
            });
        
            this.loadFragment({
                id: "uploadDialog",
                name: "dataupload.view.fragments.duplicate",
                controller: this
                
            }).then(function (oDialog) {
                oDialog.setModel(oModel, "duplicatesModel");
                oDialog.open();
            });

       },
        onDraftPress: function(){
            
            var oModel = this.getView().getModel("ExcelData");
            var oDData =oModel.getData(); 
            localStorage.setItem("draftData", JSON.stringify(oDData));
            MessageToast.show("Data as Draft saved successfully!");
        }
    });
});
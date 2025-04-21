const cds = require("@sap/cds");
async function fnOpenChangeRequestCount(req) {
    try {
        // Get the currently logged in user
        const userId = req.user.id;
        let objNumber = {
            "number": ""
        }
        // Access the Change_Request entity from the service
        // const { Change_Request } = cds.entities('litemdg');

        // Query to count Change Requests with Overall_status = 'Open' for the current user
        const countResult = await SELECT.from("litemdg.Change_Request")
            .where({
                Overall_status: 'Open',
                Requested_By: userId
            });

        objNumber.number = countResult.length;
        // Return the count value
        return objNumber;
    } catch (error) {
        // Log the error
        console.error('Error getting open change request count:', error);
        throw error;
    }
}

async function fnMyInboxCount(req) {
    // Get the currently logged in user
    const userId = req.user.id;
    const WF_API = await cds.connect.to("sap_process_automation_service_user_access_New");
    const result = await WF_API.send('GET', '/workflow/rest/v1/task-instances?recipientUsers=' + userId + '&status=READY');
    let objNumber = {
        "number": result.length
    }
    return objNumber;
}
module.exports = {
    fnOpenChangeRequestCount, fnMyInboxCount

}
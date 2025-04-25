using {litemdg as service} from './service';

annotate service.MaraStagType with @(
    UI.DataPoint #Eval_by_Mattype: {
        $Type: 'UI.DataPointType',
        Value: maraTypeCount
    },
    UI.Chart #Eval_by_Mattype    : {
        Title              : 'Count by Material Types ',
        $Type              : 'UI.ChartDefinitionType',
        ChartType          : #Donut,
        Measures           : [maraTypeCount],
        Dimensions         : [MTART],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: maraTypeCount,


        }],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: MTART,
            Role     : #Category

        }]
    }
);

annotate service.RequestStats with @(
    UI.DataPoint #Eval_by_Type     : {
        $Type: 'UI.DataPointType',
        Title: 'Total Count',
        Value: requestCount
    },
    UI.Chart #Eval_by_Type         : {
        $Type              : 'UI.ChartDefinitionType',
        Title              : 'Counts By Types',
        ChartType          : #Column,
        Measures           : [requestCount],
        Dimensions         : [REQUEST_TYPE

        ],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: requestCount

        }],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: REQUEST_TYPE,
            Role     : #Series

        }]
    },
    UI.DataPoint #Eval_by_Type_User: {
        $Type: 'UI.DataPointType',
        Title: 'Total Count',
        Value: requestCount
    },
    UI.Chart #Eval_by_Type_User    : {
        $Type              : 'UI.ChartDefinitionType',
        Title              : 'By Request Types and Status',
        ChartType          : #ColumnStacked,
        Measures           : [requestCount],
        Dimensions         : [
            REQUEST_TYPE,
            Requested_By
        ],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: requestCount

        }],
        DimensionAttributes: [
            {
                $Type    : 'UI.ChartDimensionAttributeType',
                Dimension: REQUEST_TYPE,
                Role     : #Series

            },
            {
                $Type    : 'UI.ChartDimensionAttributeType',
                Dimension: Requested_By,
                Role     : #Category
            }
        ]
    },


    UI.DataPoint #Eval_by_Status   : {
        $Type: 'UI.DataPointType',
        Title: 'Total Count',
        Value: requestCount
    },

    UI.Chart #Eval_by_Status       : {
        Title   : 'Counts by Status',
        $Type              : 'UI.ChartDefinitionType',
        ChartType          : #Column,
        Measures           : [requestCount],
        Dimensions         : [Overall_status],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: requestCount

        }],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: Overall_status

        }]

    },


    //Change Request by Date

    UI.DataPoint #Eval_by_ReqDate  : {
        $Type: 'UI.DataPointType',
        Title: 'Total Count',
        Value: requestCount


    },
    UI.Chart #Eval_by_ReqDate      : {
        $Type              : 'UI.ChartDefinitionType',
        Title              : 'Change Requests by Requested Date',
        ChartType          : #Line,
        Measures           : [requestCount],
        Dimensions         : [Requested_By],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: requestCount

        }],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: Requested_By

        }]
    },

    //change Request by Approval Date

    UI.DataPoint #Eval_by_AppType  : {
        $Type: 'UI.DataPointType',
        Title: 'Total Count',
        Value: requestCount
    },
    UI.Chart #Eval_by_AppType      : {
        $Type              : 'UI.ChartDefinitionType',
        Title              : 'Change Requests by Approval Date',
        ChartType          : #Line,
        Measures           : [requestCount],
        Dimensions         : [Aprroved_date],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: requestCount

        }],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: Aprroved_date

        }]
    },


);

//By Model
annotate service.ObjectStats with @(

    UI.DataPoint #Eval_by_Type_Status: {
        $Type: 'UI.DataPointType',
        Title: 'Total Count',
        Value: ObjectStatsCount
    },
    UI.Chart #Eval_by_Type_Status    : {
        $Type              : 'UI.ChartDefinitionType',
        Title              : 'Count by Material types and Approval status',
        ChartType          : #ColumnStacked,
        Measures           : [ObjectStatsCount],
        Dimensions         : [
            Material_type,
            Overall_status
        ],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: ObjectStatsCount

        }],
        DimensionAttributes: [
            {
                $Type    : 'UI.ChartDimensionAttributeType',
                Dimension: Overall_status,
                Role     : #Series

            },
            {
                $Type    : 'UI.ChartDimensionAttributeType',
                Dimension: Material_type,
                Role     : #Category
            }
        ]
    },

    UI.DataPoint #Eval_by_MatStatus  : {
        $Type: 'UI.DataPointType',
        Title: 'Total Count',
        Value: ObjectStatsCount
    },

    UI.Chart #Eval_by_MatStatus      : {
        $Type              : 'UI.ChartDefinitionType',
        Title              : 'Change Requests by Status',
        ChartType          : #Column,
        Measures           : [ObjectStatsCount],
        Dimensions         : [Overall_status

        ],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: ObjectStatsCount

        }],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: Overall_status,
            Role     : #Series

        }]

    },

    //by Model Type
    UI.DataPoint #Eval_by_MatType    : {
        $Type: 'UI.DataPointType',
        Title: 'Total Count',
        Value: ObjectStatsCount
    },

    UI.Chart #Eval_by_MatType        : {
        $Type              : 'UI.ChartDefinitionType',
        Title              : 'Change Requests by Types',
        ChartType          : #Column,
        Measures           : [ObjectStatsCount],
        Dimensions         : [Material_type],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: ObjectStatsCount

        }],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: Material_type

        }]

    }

);

annotate service.MaraStagType with @(
    UI.DataPoint #stock       : {
        $Type: 'UI.DataPointType',
        Title: 'Material Types',
        Value: maraTypeCount
    },
    UI.LineItem #View4        : [
        {
            $Type            : 'UI.DataField',
            Label            : 'Material Types',
            Value            : MTART,
            ![@UI.Importance]: #High
        },

        {
            $Type            : 'UI.DataField',
            Label            : 'Count',
            Value            : maraTypeCount,
            ![@UI.Importance]: #High
        }
    ],

    UI.Chart #Eval_by_MaraType: {
        $Type              : 'UI.ChartDefinitionType',
        Title              : 'Line Graph',
        ChartType          : #Column,
        Measures           : [maraTypeCount],
        Dimensions         : [MTART],
        MeasureAttributes  : [{
            $Type  : 'UI.ChartMeasureAttributeType',
            Measure: maraTypeCount

        }],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: MTART

        }]
    },
);
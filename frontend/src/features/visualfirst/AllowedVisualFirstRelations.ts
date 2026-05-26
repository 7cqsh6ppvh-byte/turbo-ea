/**
 * ArchiMate 3.2 relationship validation matrix.
 *
 * Valid relationships between ArchiMate element types, derived from Archi's
 * relationships.xml (bigArchiMate). Used at runtime to validate relation creation.
 *
 * Note: The abstract "Relationship" class from ArchiMate is excluded - only concrete
 * element types are included here. Junction elements use Association as the universal
 * fallback per ArchiMate specification.
 */

/**
 * Convert plugin card type key to ArchiMate element name (identity after prefix removal).
 */
function pluginToArchiName(pluginKey: string): string {
    return pluginKey;
}

/**
 * Full relationship matrix: sourceType -> targetType -> [relationTypes]
 * Relations are returned as full keys (e.g., "arch_rel_Serving")
 */
const RELATIONSHIP_MATRIX: Record<string, Record<string, string[]>> = {
    "ApplicationCollaboration": {
        "ApplicationCollaboration": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "ApplicationComponent": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "ApplicationEvent": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "ApplicationFunction": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "ApplicationInteraction": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "ApplicationInterface": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "ApplicationProcess": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "ApplicationService": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Artifact": {
        "ApplicationCollaboration": [
            "Association",
            "Realization"
        ],
        "ApplicationComponent": [
            "Association",
            "Realization"
        ],
        "ApplicationEvent": [
            "Association",
            "Realization"
        ],
        "ApplicationFunction": [
            "Association",
            "Realization"
        ],
        "ApplicationInteraction": [
            "Association",
            "Realization"
        ],
        "ApplicationInterface": [
            "Association",
            "Realization"
        ],
        "ApplicationProcess": [
            "Association",
            "Realization"
        ],
        "ApplicationService": [
            "Association",
            "Realization"
        ],
        "Artifact": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association",
            "Realization"
        ],
        "BusinessFunction": [
            "Association",
            "Realization"
        ],
        "BusinessInteraction": [
            "Association",
            "Realization"
        ],
        "BusinessInterface": [
            "Association",
            "Realization"
        ],
        "BusinessObject": [
            "Association",
            "Realization"
        ],
        "BusinessProcess": [
            "Association",
            "Realization"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association",
            "Realization"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association",
            "Realization"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Association",
            "Realization"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association",
            "Realization"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association",
            "Realization"
        ],
        "TechnologyFunction": [
            "Association",
            "Realization"
        ],
        "TechnologyInteraction": [
            "Association",
            "Realization"
        ],
        "TechnologyInterface": [
            "Association",
            "Realization"
        ],
        "TechnologyProcess": [
            "Association",
            "Realization"
        ],
        "TechnologyService": [
            "Association",
            "Realization"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Assessment": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "BusinessActor": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Assignment",
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Assignment",
            "Association"
        ]
    },
    "BusinessCollaboration": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Assignment",
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Assignment",
            "Association"
        ]
    },
    "BusinessEvent": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "BusinessFunction": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "BusinessInteraction": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "BusinessInterface": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "BusinessObject": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "BusinessProcess": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "BusinessRole": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Assignment",
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Assignment",
            "Association"
        ]
    },
    "BusinessService": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Capability": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "CommunicationNetwork": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association",
            "Realization"
        ],
        "SystemSoftware": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Constraint": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Contract": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "CourseOfAction": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "DataObject": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association",
            "Realization"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association",
            "Realization"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Deliverable": {
        "ApplicationCollaboration": [
            "Association",
            "Realization"
        ],
        "ApplicationComponent": [
            "Association",
            "Realization"
        ],
        "ApplicationEvent": [
            "Association",
            "Realization"
        ],
        "ApplicationFunction": [
            "Association",
            "Realization"
        ],
        "ApplicationInteraction": [
            "Association",
            "Realization"
        ],
        "ApplicationInterface": [
            "Association",
            "Realization"
        ],
        "ApplicationProcess": [
            "Association",
            "Realization"
        ],
        "ApplicationService": [
            "Association",
            "Realization"
        ],
        "Artifact": [
            "Association",
            "Realization"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association",
            "Realization"
        ],
        "BusinessCollaboration": [
            "Association",
            "Realization"
        ],
        "BusinessEvent": [
            "Association",
            "Realization"
        ],
        "BusinessFunction": [
            "Association",
            "Realization"
        ],
        "BusinessInteraction": [
            "Association",
            "Realization"
        ],
        "BusinessInterface": [
            "Association",
            "Realization"
        ],
        "BusinessObject": [
            "Association",
            "Realization"
        ],
        "BusinessProcess": [
            "Association",
            "Realization"
        ],
        "BusinessRole": [
            "Association",
            "Realization"
        ],
        "BusinessService": [
            "Association",
            "Realization"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Association",
            "Realization"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association",
            "Realization"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Association",
            "Realization"
        ],
        "Deliverable": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "Device": [
            "Association",
            "Realization"
        ],
        "DistributionNetwork": [
            "Association",
            "Realization"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association",
            "Realization"
        ],
        "Facility": [
            "Association",
            "Realization"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association",
            "Realization"
        ],
        "Material": [
            "Association",
            "Realization"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association",
            "Realization"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association",
            "Realization"
        ],
        "Plateau": [
            "Association",
            "Realization"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association",
            "Realization"
        ],
        "Representation": [
            "Association",
            "Realization"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association",
            "Realization"
        ],
        "SystemSoftware": [
            "Association",
            "Realization"
        ],
        "TechnologyCollaboration": [
            "Association",
            "Realization"
        ],
        "TechnologyEvent": [
            "Association",
            "Realization"
        ],
        "TechnologyFunction": [
            "Association",
            "Realization"
        ],
        "TechnologyInteraction": [
            "Association",
            "Realization"
        ],
        "TechnologyInterface": [
            "Association",
            "Realization"
        ],
        "TechnologyProcess": [
            "Association",
            "Realization"
        ],
        "TechnologyService": [
            "Association",
            "Realization"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Device": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "DistributionNetwork": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Assignment",
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association",
            "Realization"
        ],
        "SystemSoftware": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Assignment",
            "Association"
        ]
    },
    "Driver": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Equipment": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Facility": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Assignment",
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Assignment",
            "Association"
        ]
    },
    "Gap": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "Goal": [
            "Association"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Association"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Goal": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Grouping": {
        "ApplicationCollaboration": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Composition",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Assessment": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "BusinessActor": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Composition",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization"
        ],
        "BusinessProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "CommunicationNetwork": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Contract": [
            "Access",
            "Composition",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization"
        ],
        "CourseOfAction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "DataObject": [
            "Access",
            "Composition",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Deliverable": [
            "Access",
            "Composition",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Device": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Equipment": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "Goal": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Specialization",
            "Triggering"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Composition",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Meaning": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Node": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Path": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering"
        ],
        "Principle": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Product": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Composition",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Requirement": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Resource": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Stakeholder": [
            "Composition",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "SystemSoftware": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "ValueStream": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "WorkPackage": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Specialization",
            "Triggering"
        ]
    },
    "ImplementationEvent": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Access",
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization",
            "Triggering"
        ],
        "ImplementationEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Flow",
            "Association",
            "Triggering"
        ],
        "Principle": [
            "Influence",
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Flow",
            "Association",
            "Triggering"
        ]
    },
    "Junction": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association",
            "Realization"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association",
            "Realization"
        ],
        "BusinessProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association",
            "Realization"
        ],
        "CourseOfAction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DataObject": [
            "Access",
            "Association",
            "Realization"
        ],
        "Deliverable": [
            "Access",
            "Association",
            "Realization"
        ],
        "Device": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Flow",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Assignment",
            "Association",
            "Realization"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Flow",
            "Association",
            "Realization",
            "Triggering"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association",
            "Realization"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association",
            "Realization"
        ],
        "SystemSoftware": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "WorkPackage": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering"
        ]
    },
    "Location": {
        "ApplicationCollaboration": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Composition",
            "Aggregation",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "BusinessProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "CourseOfAction": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "Deliverable": [
            "Composition",
            "Aggregation",
            "Association"
        ],
        "Device": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Composition",
            "Aggregation",
            "Association"
        ],
        "Goal": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Composition",
            "Aggregation",
            "Assignment",
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Composition",
            "Aggregation",
            "Assignment",
            "Association"
        ],
        "Meaning": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association"
        ],
        "Node": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Composition",
            "Aggregation",
            "Association"
        ],
        "Principle": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "Requirement": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Composition",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization"
        ],
        "SystemSoftware": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Composition",
            "Aggregation",
            "Assignment",
            "Association"
        ]
    },
    "Material": {
        "ApplicationCollaboration": [
            "Association",
            "Realization"
        ],
        "ApplicationComponent": [
            "Association",
            "Realization"
        ],
        "ApplicationEvent": [
            "Association",
            "Realization"
        ],
        "ApplicationFunction": [
            "Association",
            "Realization"
        ],
        "ApplicationInteraction": [
            "Association",
            "Realization"
        ],
        "ApplicationInterface": [
            "Association",
            "Realization"
        ],
        "ApplicationProcess": [
            "Association",
            "Realization"
        ],
        "ApplicationService": [
            "Association",
            "Realization"
        ],
        "Artifact": [
            "Association",
            "Realization"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association",
            "Realization"
        ],
        "BusinessFunction": [
            "Association",
            "Realization"
        ],
        "BusinessInteraction": [
            "Association",
            "Realization"
        ],
        "BusinessInterface": [
            "Association",
            "Realization"
        ],
        "BusinessObject": [
            "Association",
            "Realization"
        ],
        "BusinessProcess": [
            "Association",
            "Realization"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association",
            "Realization"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association",
            "Realization"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Association",
            "Realization"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association",
            "Realization"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association",
            "Realization"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization",
            "Specialization"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association",
            "Realization"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association",
            "Realization"
        ],
        "TechnologyFunction": [
            "Association",
            "Realization"
        ],
        "TechnologyInteraction": [
            "Association",
            "Realization"
        ],
        "TechnologyInterface": [
            "Association",
            "Realization"
        ],
        "TechnologyProcess": [
            "Association",
            "Realization"
        ],
        "TechnologyService": [
            "Association",
            "Realization"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Meaning": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Node": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Assignment",
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Assignment",
            "Association"
        ]
    },
    "Outcome": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Path": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Assignment",
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Assignment",
            "Association"
        ]
    },
    "Plateau": {
        "ApplicationCollaboration": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "ApplicationComponent": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "ApplicationEvent": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "ApplicationFunction": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "ApplicationInteraction": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "ApplicationInterface": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "ApplicationProcess": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "ApplicationService": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Artifact": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "BusinessCollaboration": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "BusinessEvent": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "BusinessFunction": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "BusinessInteraction": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "BusinessInterface": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "BusinessObject": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "BusinessProcess": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "BusinessRole": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "BusinessService": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Capability": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Constraint": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "CourseOfAction": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Deliverable": [
            "Access",
            "Association"
        ],
        "Device": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "DistributionNetwork": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Facility": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering"
        ],
        "ImplementationEvent": [
            "Flow",
            "Association",
            "Triggering"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Material": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Outcome": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Plateau": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Representation": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Requirement": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association",
            "Realization"
        ],
        "SystemSoftware": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "TechnologyCollaboration": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "TechnologyEvent": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "TechnologyFunction": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "TechnologyInteraction": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "TechnologyInterface": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "TechnologyProcess": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "TechnologyService": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Composition",
            "Aggregation",
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Flow",
            "Association",
            "Triggering"
        ]
    },
    "Principle": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Product": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Composition",
            "Aggregation",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Relationship": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Association"
        ],
        "Grouping": [
            "Association"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Association"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Representation": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association",
            "Realization"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association",
            "Realization"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Composition",
            "Aggregation",
            "Association",
            "Specialization"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Requirement": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Resource": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Stakeholder": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "SystemSoftware": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "TechnologyCollaboration": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Assignment",
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Assignment",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Assignment",
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Assignment",
            "Association"
        ]
    },
    "TechnologyEvent": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "TechnologyFunction": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "TechnologyInteraction": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "TechnologyInterface": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Assignment",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "TechnologyProcess": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "TechnologyService": {
        "ApplicationCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationComponent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "ApplicationService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Artifact": [
            "Access",
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessObject": [
            "Access",
            "Association"
        ],
        "BusinessProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessRole": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "BusinessService": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Access",
            "Association"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Access",
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "DistributionNetwork": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Facility": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Material": [
            "Access",
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Representation": [
            "Access",
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyCollaboration": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyEvent": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyFunction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInteraction": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyInterface": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyProcess": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "TechnologyService": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "Value": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Association"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Association"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association"
        ],
        "Grouping": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association"
        ],
        "Resource": [
            "Association"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Composition",
            "Aggregation",
            "Influence",
            "Association",
            "Specialization"
        ],
        "ValueStream": [
            "Association"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "ValueStream": {
        "ApplicationCollaboration": [
            "Association"
        ],
        "ApplicationComponent": [
            "Association"
        ],
        "ApplicationEvent": [
            "Association"
        ],
        "ApplicationFunction": [
            "Association"
        ],
        "ApplicationInteraction": [
            "Association"
        ],
        "ApplicationInterface": [
            "Association"
        ],
        "ApplicationProcess": [
            "Association"
        ],
        "ApplicationService": [
            "Association"
        ],
        "Artifact": [
            "Association"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association"
        ],
        "BusinessCollaboration": [
            "Association"
        ],
        "BusinessEvent": [
            "Association"
        ],
        "BusinessFunction": [
            "Association"
        ],
        "BusinessInteraction": [
            "Association"
        ],
        "BusinessInterface": [
            "Association"
        ],
        "BusinessObject": [
            "Association"
        ],
        "BusinessProcess": [
            "Association"
        ],
        "BusinessRole": [
            "Association"
        ],
        "BusinessService": [
            "Association"
        ],
        "Capability": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "CommunicationNetwork": [
            "Association"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association"
        ],
        "CourseOfAction": [
            "Flow",
            "Association",
            "Realization",
            "Triggering",
            "Serving"
        ],
        "DataObject": [
            "Association"
        ],
        "Deliverable": [
            "Association"
        ],
        "Device": [
            "Association"
        ],
        "DistributionNetwork": [
            "Association"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association"
        ],
        "Facility": [
            "Association"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "ImplementationEvent": [
            "Association"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association"
        ],
        "Material": [
            "Association"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association"
        ],
        "Plateau": [
            "Association"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association"
        ],
        "Representation": [
            "Association"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Flow",
            "Association",
            "Triggering",
            "Serving"
        ],
        "Stakeholder": [
            "Influence",
            "Association"
        ],
        "SystemSoftware": [
            "Association"
        ],
        "TechnologyCollaboration": [
            "Association"
        ],
        "TechnologyEvent": [
            "Association"
        ],
        "TechnologyFunction": [
            "Association"
        ],
        "TechnologyInteraction": [
            "Association"
        ],
        "TechnologyInterface": [
            "Association"
        ],
        "TechnologyProcess": [
            "Association"
        ],
        "TechnologyService": [
            "Association"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "WorkPackage": [
            "Association"
        ]
    },
    "WorkPackage": {
        "ApplicationCollaboration": [
            "Association",
            "Realization"
        ],
        "ApplicationComponent": [
            "Association",
            "Realization"
        ],
        "ApplicationEvent": [
            "Association",
            "Realization"
        ],
        "ApplicationFunction": [
            "Association",
            "Realization"
        ],
        "ApplicationInteraction": [
            "Association",
            "Realization"
        ],
        "ApplicationInterface": [
            "Association",
            "Realization"
        ],
        "ApplicationProcess": [
            "Association",
            "Realization"
        ],
        "ApplicationService": [
            "Association",
            "Realization"
        ],
        "Artifact": [
            "Association",
            "Realization"
        ],
        "Assessment": [
            "Influence",
            "Association"
        ],
        "BusinessActor": [
            "Association",
            "Realization"
        ],
        "BusinessCollaboration": [
            "Association",
            "Realization"
        ],
        "BusinessEvent": [
            "Association",
            "Realization"
        ],
        "BusinessFunction": [
            "Association",
            "Realization"
        ],
        "BusinessInteraction": [
            "Association",
            "Realization"
        ],
        "BusinessInterface": [
            "Association",
            "Realization"
        ],
        "BusinessObject": [
            "Association",
            "Realization"
        ],
        "BusinessProcess": [
            "Association",
            "Realization"
        ],
        "BusinessRole": [
            "Association",
            "Realization"
        ],
        "BusinessService": [
            "Association",
            "Realization"
        ],
        "Capability": [
            "Association",
            "Realization"
        ],
        "CommunicationNetwork": [
            "Association",
            "Realization"
        ],
        "Constraint": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Contract": [
            "Association",
            "Realization"
        ],
        "CourseOfAction": [
            "Association",
            "Realization"
        ],
        "DataObject": [
            "Association",
            "Realization"
        ],
        "Deliverable": [
            "Access",
            "Association",
            "Realization"
        ],
        "Device": [
            "Association",
            "Realization"
        ],
        "DistributionNetwork": [
            "Association",
            "Realization"
        ],
        "Driver": [
            "Influence",
            "Association"
        ],
        "Equipment": [
            "Association",
            "Realization"
        ],
        "Facility": [
            "Association",
            "Realization"
        ],
        "Gap": [
            "Association"
        ],
        "Goal": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Grouping": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering"
        ],
        "ImplementationEvent": [
            "Flow",
            "Association",
            "Triggering"
        ],
        "Junction": [
            "Access",
            "Composition",
            "Flow",
            "Aggregation",
            "Assignment",
            "Influence",
            "Association",
            "Realization",
            "Specialization",
            "Triggering",
            "Serving"
        ],
        "Location": [
            "Association",
            "Realization"
        ],
        "Material": [
            "Association",
            "Realization"
        ],
        "Meaning": [
            "Influence",
            "Association"
        ],
        "Node": [
            "Association",
            "Realization"
        ],
        "Outcome": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Path": [
            "Association",
            "Realization"
        ],
        "Plateau": [
            "Flow",
            "Association",
            "Realization",
            "Triggering"
        ],
        "Principle": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Product": [
            "Association",
            "Realization"
        ],
        "Representation": [
            "Association",
            "Realization"
        ],
        "Requirement": [
            "Influence",
            "Association",
            "Realization"
        ],
        "Resource": [
            "Association",
            "Realization"
        ],
        "Stakeholder": [
            "Influence",
            "Association",
            "Realization"
        ],
        "SystemSoftware": [
            "Association",
            "Realization"
        ],
        "TechnologyCollaboration": [
            "Association",
            "Realization"
        ],
        "TechnologyEvent": [
            "Association",
            "Realization"
        ],
        "TechnologyFunction": [
            "Association",
            "Realization"
        ],
        "TechnologyInteraction": [
            "Association",
            "Realization"
        ],
        "TechnologyInterface": [
            "Association",
            "Realization"
        ],
        "TechnologyProcess": [
            "Association",
            "Realization"
        ],
        "TechnologyService": [
            "Association",
            "Realization"
        ],
        "Value": [
            "Influence",
            "Association"
        ],
        "ValueStream": [
            "Association",
            "Realization"
        ],
        "WorkPackage": [
            "Composition",
            "Flow",
            "Aggregation",
            "Association",
            "Specialization",
            "Triggering"
        ]
    }
}
;

/**
 * Check if a relationship between two ArchiMate element types is valid.
 *
 * @param sourceTypeKey - Plugin card type key (e.g., "arch_ApplicationComponent")
 * @param targetTypeKey - Plugin card type key (e.g., "arch_ApplicationService")
 * @param relationTypeKey - Plugin relation type key (e.g., "arch_rel_Serving")
 * @returns True if the relationship is permitted in ArchiMate 3.2
 */
export function isValidArchimateRelation(
    sourceTypeKey: string,
    targetTypeKey: string,
    relationTypeKey: string
): boolean {
    const source = pluginToArchiName(sourceTypeKey);
    const target = pluginToArchiName(targetTypeKey);
    const relationName = pluginToArchiName(relationTypeKey);

    return (
        source in RELATIONSHIP_MATRIX &&
        target in RELATIONSHIP_MATRIX[source] &&
        RELATIONSHIP_MATRIX[source][target].includes(relationName)
    );
}

/**
 * Get all valid ArchiMate relation type keys between two element types.
 *
 * @param sourceTypeKey - Plugin card type key
 * @param targetTypeKey - Plugin card type key
 * @returns Array of valid relation type keys (e.g., ["arch_rel_Serving", "arch_rel_Realization"])
 */
export function getValidRelationKeys(
    sourceTypeKey: string,
    targetTypeKey: string
): string[] {
    const source = pluginToArchiName(sourceTypeKey);
    const target = pluginToArchiName(targetTypeKey);

    if (source in RELATIONSHIP_MATRIX && target in RELATIONSHIP_MATRIX[source]) {
        return RELATIONSHIP_MATRIX[source][target];
    }
    return [];
}

/**
 * Get all valid ArchiMate relationship names between two element types.
 *
 * @param sourceTypeKey - Plugin card type key
 * @param targetTypeKey - Plugin card type key
 * @returns Array of valid relation type names
 */
export function getValidRelationNames(
    sourceTypeKey: string,
    targetTypeKey: string
): string[] {
    const source = pluginToArchiName(sourceTypeKey);
    const target = pluginToArchiName(targetTypeKey);

    if (source in RELATIONSHIP_MATRIX && target in RELATIONSHIP_MATRIX[source]) {
        return [...RELATIONSHIP_MATRIX[source][target]];
    }
    return [];
}

/**
 * Check if both types are valid ArchiMate element types.
 */
export function isArchiMateElementType(typeKey: string): boolean {
    const name = pluginToArchiName(typeKey);
    return name in RELATIONSHIP_MATRIX;
}

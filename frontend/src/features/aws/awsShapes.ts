export interface AwsElementMeta {
  key: string;
  label: string;
  category: string;
  icon: string;
  color: string;
  isContainer?: boolean;
}

export const AWS_ELEMENT_META: AwsElementMeta[] = [
  // Grouping
  { key: "aws_Account", label: "AWS Account", category: "AWS:Grouping", icon: "folder", color: "#232F3E", isContainer: true },
  { key: "aws_Region", label: "AWS Region", category: "AWS:Grouping", icon: "public", color: "#232F3E", isContainer: true },
  { key: "aws_AvailabilityZone", label: "Availability Zone", category: "AWS:Grouping", icon: "layers", color: "#232F3E", isContainer: true },
  { key: "aws_VPC", label: "VPC", category: "AWS:Grouping", icon: "lan", color: "#232F3E", isContainer: true },
  { key: "aws_Subnet", label: "Subnet", category: "AWS:Grouping", icon: "segment", color: "#232F3E", isContainer: true },
  // Compute
  { key: "aws_EC2Instance", label: "EC2 Instance", category: "AWS:Compute", icon: "computer", color: "#FF9900" },
  { key: "aws_LambdaFunction", label: "Lambda Function", category: "AWS:Compute", icon: "functions", color: "#FF9900" },
  { key: "aws_ECSCluster", label: "ECS Cluster", category: "AWS:Compute", icon: "grid_view", color: "#FF9900" },
  { key: "aws_EKSCluster", label: "EKS Cluster", category: "AWS:Compute", icon: "hub", color: "#FF9900" },
  { key: "aws_ElasticBeanstalk", label: "Elastic Beanstalk", category: "AWS:Compute", icon: "deployed_code", color: "#FF9900" },
  { key: "aws_AutoScalingGroup", label: "Auto Scaling Group", category: "AWS:Compute", icon: "expand", color: "#FF9900" },
  { key: "aws_Lightsail", label: "Lightsail", category: "AWS:Compute", icon: "bolt", color: "#FF9900" },
  // Storage
  { key: "aws_S3Bucket", label: "S3 Bucket", category: "AWS:Storage", icon: "storage", color: "#7AA116" },
  { key: "aws_EBSVolume", label: "EBS Volume", category: "AWS:Storage", icon: "hard_drive", color: "#7AA116" },
  { key: "aws_EFSFileSystem", label: "EFS File System", category: "AWS:Storage", icon: "folder_open", color: "#7AA116" },
  { key: "aws_S3Glacier", label: "S3 Glacier", category: "AWS:Storage", icon: "archive", color: "#7AA116" },
  { key: "aws_DataSync", label: "DataSync", category: "AWS:Storage", icon: "sync", color: "#7AA116" },
  // Database
  { key: "aws_RDSInstance", label: "RDS Instance", category: "AWS:Database", icon: "database", color: "#3F8624" },
  { key: "aws_AuroraCluster", label: "Aurora Cluster", category: "AWS:Database", icon: "database", color: "#3F8624" },
  { key: "aws_DynamoDBTable", label: "DynamoDB Table", category: "AWS:Database", icon: "table_chart", color: "#3F8624" },
  { key: "aws_RedshiftCluster", label: "Redshift Cluster", category: "AWS:Database", icon: "analytics", color: "#3F8624" },
  { key: "aws_ElastiCacheCluster", label: "ElastiCache Cluster", category: "AWS:Database", icon: "memory", color: "#3F8624" },
  { key: "aws_DocumentDB", label: "DocumentDB", category: "AWS:Database", icon: "description", color: "#3F8624" },
  { key: "aws_NeptuneDB", label: "Neptune DB", category: "AWS:Database", icon: "share", color: "#3F8624" },
  // Networking
  { key: "aws_LoadBalancer", label: "Load Balancer", category: "AWS:Networking", icon: "balance", color: "#8C4FFF" },
  { key: "aws_Route53", label: "Route 53", category: "AWS:Networking", icon: "dns", color: "#8C4FFF" },
  { key: "aws_CloudFront", label: "CloudFront", category: "AWS:Networking", icon: "speed", color: "#8C4FFF" },
  { key: "aws_DirectConnect", label: "Direct Connect", category: "AWS:Networking", icon: "cable", color: "#8C4FFF" },
  { key: "aws_VPNGateway", label: "VPN Gateway", category: "AWS:Networking", icon: "vpn_lock", color: "#8C4FFF" },
  { key: "aws_APIGateway", label: "API Gateway", category: "AWS:Networking", icon: "api", color: "#8C4FFF" },
  { key: "aws_NATGateway", label: "NAT Gateway", category: "AWS:Networking", icon: "swap_horiz", color: "#8C4FFF" },
  { key: "aws_TransitGateway", label: "Transit Gateway", category: "AWS:Networking", icon: "device_hub", color: "#8C4FFF" },
  // Analytics
  { key: "aws_KinesisStream", label: "Kinesis Stream", category: "AWS:Analytics", icon: "stream", color: "#E7157B" },
  { key: "aws_Athena", label: "Athena", category: "AWS:Analytics", icon: "query_stats", color: "#E7157B" },
  { key: "aws_EMRCluster", label: "EMR Cluster", category: "AWS:Analytics", icon: "bubble_chart", color: "#E7157B" },
  { key: "aws_GlueJob", label: "Glue Job", category: "AWS:Analytics", icon: "transform", color: "#E7157B" },
  { key: "aws_QuickSight", label: "QuickSight", category: "AWS:Analytics", icon: "bar_chart", color: "#E7157B" },
  // Security
  { key: "aws_IAMRole", label: "IAM Role", category: "AWS:Security", icon: "manage_accounts", color: "#DD344C" },
  { key: "aws_SecretsManager", label: "Secrets Manager", category: "AWS:Security", icon: "key", color: "#DD344C" },
  { key: "aws_KMSKey", label: "KMS Key", category: "AWS:Security", icon: "lock", color: "#DD344C" },
  { key: "aws_CloudTrail", label: "CloudTrail", category: "AWS:Security", icon: "history", color: "#DD344C" },
  { key: "aws_GuardDuty", label: "GuardDuty", category: "AWS:Security", icon: "shield", color: "#DD344C" },
  { key: "aws_SecurityGroup", label: "Security Group", category: "AWS:Security", icon: "security", color: "#DD344C" },
  { key: "aws_WAF", label: "WAF", category: "AWS:Security", icon: "firewall", color: "#DD344C" },
  // Management
  { key: "aws_CloudWatch", label: "CloudWatch", category: "AWS:Management", icon: "monitor_heart", color: "#E7157B" },
  { key: "aws_CloudFormation", label: "CloudFormation", category: "AWS:Management", icon: "account_tree", color: "#E7157B" },
  { key: "aws_SystemsManager", label: "Systems Manager", category: "AWS:Management", icon: "settings", color: "#E7157B" },
  { key: "aws_SNSTopic", label: "SNS Topic", category: "AWS:Management", icon: "notifications", color: "#E7157B" },
  { key: "aws_SQSQueue", label: "SQS Queue", category: "AWS:Management", icon: "queue", color: "#E7157B" },
  { key: "aws_StepFunctions", label: "Step Functions", category: "AWS:Management", icon: "schema", color: "#E7157B" },
  { key: "aws_EventBridge", label: "EventBridge", category: "AWS:Management", icon: "event", color: "#E7157B" },
  { key: "aws_CodePipeline", label: "CodePipeline", category: "AWS:Management", icon: "build", color: "#E7157B" },
];

export const AWS_ELEMENT_MAP = new Map(AWS_ELEMENT_META.map((e) => [e.key, e]));

export const AWS_CATEGORIES = [
  "AWS:Grouping",
  "AWS:Compute",
  "AWS:Storage",
  "AWS:Database",
  "AWS:Networking",
  "AWS:Analytics",
  "AWS:Security",
  "AWS:Management",
] as const;

export const AWS_RELATION_STYLES: Record<string, { strokeDasharray?: string }> = {
  aws_rel_containedIn: {},
  aws_rel_networkAttachment: { strokeDasharray: "6 3" },
  aws_rel_securityRule: { strokeDasharray: "4 2" },
  aws_rel_routing: {},
  aws_rel_dataReplication: { strokeDasharray: "6 3" },
  aws_rel_logTarget: { strokeDasharray: "4 4" },
  aws_rel_serviceDependency: {},
  aws_rel_encryptedBy: { strokeDasharray: "4 2" },
  aws_rel_accessControlledBy: { strokeDasharray: "4 2" },
  aws_rel_triggerOf: {},
  aws_rel_backupOf: { strokeDasharray: "6 3" },
  aws_rel_failoverTo: { strokeDasharray: "8 4" },
};

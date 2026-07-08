import {registerEnumType} from "@nestjs/graphql"

export enum MemberType {
    USER = "USER",
    AGENT = "AGENT",
    ADMIN = "ADMIN"
}
registerEnumType(MemberType, {name: "MemberType"})

export enum MemberStatus {
    ACTIVE = "ACTIVE",
    DELETED = "DELETED",
    BLOCK = "BLOCK"
}
registerEnumType(MemberStatus, {name: "MemberStatus"})

export enum MemberAuthType {
    EMAIL = "EMAIL",
    PHONE = "PHONE",
    TELEGRAM = "TELEGRAM"
}
registerEnumType(MemberAuthType, {name: "MemberAuthType"})

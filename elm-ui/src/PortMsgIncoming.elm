module PortMsgIncoming exposing (..)

import Json.Decode as JD
import Json.Encode as JE


type PortMsgIncoming
    = Invalid String
    | Message String


decodePortValue : JE.Value -> PortMsgIncoming
decodePortValue value =
    case JD.decodeValue (portValueDecoder value) value of
        Ok msg ->
            msg

        Err error ->
            Invalid <| JD.errorToString error


portValueDecoder : JE.Value -> JD.Decoder PortMsgIncoming
portValueDecoder value =
    case JD.decodeValue (JD.field "type" JD.string) value of
        Ok messageType ->
            portMessageDecoder messageType

        Err error ->
            JD.map Invalid (JD.succeed <| JD.errorToString error)


portMessageDecoder : String -> JD.Decoder PortMsgIncoming
portMessageDecoder messageType =
    case messageType of
        "Message" ->
            JD.map Message <| JD.field "message" JD.string

        _ ->
            JD.map Invalid <| JD.succeed <| "invalid port message type: " ++ messageType

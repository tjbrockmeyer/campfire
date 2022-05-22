module PortMsgIn exposing (..)

import Json.Decode as JD
import Json.Encode as JE


type PortMsgIn
    = Invalid String
    | Message String


decodePortValue : JE.Value -> PortMsgIn
decodePortValue value =
    case JD.decodeValue (portValueDecoder value) value of
        Ok msg ->
            msg

        Err error ->
            Invalid <| JD.errorToString error


portValueDecoder : JE.Value -> JD.Decoder PortMsgIn
portValueDecoder value =
    case JD.decodeValue (JD.field "type" JD.string) value of
        Ok messageType ->
            portMessageDecoder messageType

        Err error ->
            JD.map Invalid (JD.succeed <| JD.errorToString error)


portMessageDecoder : String -> JD.Decoder PortMsgIn
portMessageDecoder messageType =
    case messageType of
        "Message" ->
            JD.map Message <| JD.field "message" JD.string

        _ ->
            JD.map Invalid <| JD.succeed <| "invalid port message type: " ++ messageType

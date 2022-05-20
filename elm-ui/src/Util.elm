module Util exposing (..)


ifThenElse : Bool -> a -> a -> a
ifThenElse value ifTrue ifFalse =
    if value then
        ifTrue

    else
        ifFalse

//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'booking_session_balance.g.dart';

/// BookingSessionBalance
///
/// Properties:
/// * [ledgerBalance] 
/// * [reserved] 
/// * [available] 
@BuiltValue()
abstract class BookingSessionBalance implements Built<BookingSessionBalance, BookingSessionBalanceBuilder> {
  @BuiltValueField(wireName: r'ledgerBalance')
  int get ledgerBalance;

  @BuiltValueField(wireName: r'reserved')
  int get reserved;

  @BuiltValueField(wireName: r'available')
  int get available;

  BookingSessionBalance._();

  factory BookingSessionBalance([void updates(BookingSessionBalanceBuilder b)]) = _$BookingSessionBalance;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BookingSessionBalanceBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BookingSessionBalance> get serializer => _$BookingSessionBalanceSerializer();
}

class _$BookingSessionBalanceSerializer implements PrimitiveSerializer<BookingSessionBalance> {
  @override
  final Iterable<Type> types = const [BookingSessionBalance, _$BookingSessionBalance];

  @override
  final String wireName = r'BookingSessionBalance';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BookingSessionBalance object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'ledgerBalance';
    yield serializers.serialize(
      object.ledgerBalance,
      specifiedType: const FullType(int),
    );
    yield r'reserved';
    yield serializers.serialize(
      object.reserved,
      specifiedType: const FullType(int),
    );
    yield r'available';
    yield serializers.serialize(
      object.available,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    BookingSessionBalance object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BookingSessionBalanceBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'ledgerBalance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.ledgerBalance = valueDes;
          break;
        case r'reserved':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.reserved = valueDes;
          break;
        case r'available':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.available = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BookingSessionBalance deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BookingSessionBalanceBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'booking_command.g.dart';

/// BookingCommand
///
/// Properties:
/// * [classSlotId] 
/// * [customerPackageId] 
/// * [customerUserId] 
/// * [source_] 
@BuiltValue()
abstract class BookingCommand implements Built<BookingCommand, BookingCommandBuilder> {
  @BuiltValueField(wireName: r'classSlotId')
  String get classSlotId;

  @BuiltValueField(wireName: r'customerPackageId')
  String get customerPackageId;

  @BuiltValueField(wireName: r'customerUserId')
  String? get customerUserId;

  @BuiltValueField(wireName: r'source')
  BookingCommandSource_Enum? get source_;
  // enum source_Enum {  SELF,  ADMIN_ASSISTED,  };

  BookingCommand._();

  factory BookingCommand([void updates(BookingCommandBuilder b)]) = _$BookingCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BookingCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BookingCommand> get serializer => _$BookingCommandSerializer();
}

class _$BookingCommandSerializer implements PrimitiveSerializer<BookingCommand> {
  @override
  final Iterable<Type> types = const [BookingCommand, _$BookingCommand];

  @override
  final String wireName = r'BookingCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BookingCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'classSlotId';
    yield serializers.serialize(
      object.classSlotId,
      specifiedType: const FullType(String),
    );
    yield r'customerPackageId';
    yield serializers.serialize(
      object.customerPackageId,
      specifiedType: const FullType(String),
    );
    if (object.customerUserId != null) {
      yield r'customerUserId';
      yield serializers.serialize(
        object.customerUserId,
        specifiedType: const FullType(String),
      );
    }
    if (object.source_ != null) {
      yield r'source';
      yield serializers.serialize(
        object.source_,
        specifiedType: const FullType(BookingCommandSource_Enum),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    BookingCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BookingCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'classSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classSlotId = valueDes;
          break;
        case r'customerPackageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerPackageId = valueDes;
          break;
        case r'customerUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerUserId = valueDes;
          break;
        case r'source':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingCommandSource_Enum),
          ) as BookingCommandSource_Enum;
          result.source_ = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BookingCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BookingCommandBuilder();
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

class BookingCommandSource_Enum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SELF')
  static const BookingCommandSource_Enum SELF = _$bookingCommandSourceEnum_SELF;
  @BuiltValueEnumConst(wireName: r'ADMIN_ASSISTED')
  static const BookingCommandSource_Enum ADMIN_ASSISTED = _$bookingCommandSourceEnum_ADMIN_ASSISTED;

  static Serializer<BookingCommandSource_Enum> get serializer => _$bookingCommandSourceEnumSerializer;

  const BookingCommandSource_Enum._(String name): super(name);

  static BuiltSet<BookingCommandSource_Enum> get values => _$bookingCommandSourceEnumValues;
  static BookingCommandSource_Enum valueOf(String name) => _$bookingCommandSourceEnumValueOf(name);
}


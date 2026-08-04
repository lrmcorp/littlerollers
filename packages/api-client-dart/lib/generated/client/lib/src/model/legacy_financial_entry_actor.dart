//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'legacy_financial_entry_actor.g.dart';

/// LegacyFinancialEntryActor
///
/// Properties:
/// * [id] 
/// * [displayName] 
@BuiltValue()
abstract class LegacyFinancialEntryActor implements Built<LegacyFinancialEntryActor, LegacyFinancialEntryActorBuilder> {
  @BuiltValueField(wireName: r'id')
  String? get id;

  @BuiltValueField(wireName: r'displayName')
  String? get displayName;

  LegacyFinancialEntryActor._();

  factory LegacyFinancialEntryActor([void updates(LegacyFinancialEntryActorBuilder b)]) = _$LegacyFinancialEntryActor;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(LegacyFinancialEntryActorBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<LegacyFinancialEntryActor> get serializer => _$LegacyFinancialEntryActorSerializer();
}

class _$LegacyFinancialEntryActorSerializer implements PrimitiveSerializer<LegacyFinancialEntryActor> {
  @override
  final Iterable<Type> types = const [LegacyFinancialEntryActor, _$LegacyFinancialEntryActor];

  @override
  final String wireName = r'LegacyFinancialEntryActor';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    LegacyFinancialEntryActor object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.id != null) {
      yield r'id';
      yield serializers.serialize(
        object.id,
        specifiedType: const FullType(String),
      );
    }
    if (object.displayName != null) {
      yield r'displayName';
      yield serializers.serialize(
        object.displayName,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    LegacyFinancialEntryActor object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required LegacyFinancialEntryActorBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  LegacyFinancialEntryActor deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = LegacyFinancialEntryActorBuilder();
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


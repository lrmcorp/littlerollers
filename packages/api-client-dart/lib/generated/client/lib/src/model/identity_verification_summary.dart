//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/identity_verification_document.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'identity_verification_summary.g.dart';

/// IdentityVerificationSummary
///
/// Properties:
/// * [status] 
/// * [documents] 
@BuiltValue()
abstract class IdentityVerificationSummary implements Built<IdentityVerificationSummary, IdentityVerificationSummaryBuilder> {
  @BuiltValueField(wireName: r'status')
  IdentityVerificationSummaryStatusEnum get status;
  // enum statusEnum {  PENDING,  ACTION_REQUIRED,  APPROVED,  };

  @BuiltValueField(wireName: r'documents')
  BuiltList<IdentityVerificationDocument> get documents;

  IdentityVerificationSummary._();

  factory IdentityVerificationSummary([void updates(IdentityVerificationSummaryBuilder b)]) = _$IdentityVerificationSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IdentityVerificationSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IdentityVerificationSummary> get serializer => _$IdentityVerificationSummarySerializer();
}

class _$IdentityVerificationSummarySerializer implements PrimitiveSerializer<IdentityVerificationSummary> {
  @override
  final Iterable<Type> types = const [IdentityVerificationSummary, _$IdentityVerificationSummary];

  @override
  final String wireName = r'IdentityVerificationSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IdentityVerificationSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(IdentityVerificationSummaryStatusEnum),
    );
    yield r'documents';
    yield serializers.serialize(
      object.documents,
      specifiedType: const FullType(BuiltList, [FullType(IdentityVerificationDocument)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IdentityVerificationSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationSummaryStatusEnum),
          ) as IdentityVerificationSummaryStatusEnum;
          result.status = valueDes;
          break;
        case r'documents':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(IdentityVerificationDocument)]),
          ) as BuiltList<IdentityVerificationDocument>;
          result.documents.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  IdentityVerificationSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IdentityVerificationSummaryBuilder();
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

class IdentityVerificationSummaryStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const IdentityVerificationSummaryStatusEnum PENDING = _$identityVerificationSummaryStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const IdentityVerificationSummaryStatusEnum ACTION_REQUIRED = _$identityVerificationSummaryStatusEnum_ACTION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const IdentityVerificationSummaryStatusEnum APPROVED = _$identityVerificationSummaryStatusEnum_APPROVED;

  static Serializer<IdentityVerificationSummaryStatusEnum> get serializer => _$identityVerificationSummaryStatusEnumSerializer;

  const IdentityVerificationSummaryStatusEnum._(String name): super(name);

  static BuiltSet<IdentityVerificationSummaryStatusEnum> get values => _$identityVerificationSummaryStatusEnumValues;
  static IdentityVerificationSummaryStatusEnum valueOf(String name) => _$identityVerificationSummaryStatusEnumValueOf(name);
}


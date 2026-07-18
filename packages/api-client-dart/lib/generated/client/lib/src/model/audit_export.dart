//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'audit_export.g.dart';

/// AuditExport
///
/// Properties:
/// * [id] 
/// * [status] 
/// * [requestedAt] 
/// * [completedAt] 
/// * [expiresAt] 
/// * [rowCount] 
/// * [failureCode] 
@BuiltValue()
abstract class AuditExport implements Built<AuditExport, AuditExportBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'status')
  AuditExportStatusEnum get status;
  // enum statusEnum {  QUEUED,  RUNNING,  READY,  FAILED,  EXPIRED,  };

  @BuiltValueField(wireName: r'requestedAt')
  DateTime get requestedAt;

  @BuiltValueField(wireName: r'completedAt')
  DateTime? get completedAt;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  @BuiltValueField(wireName: r'rowCount')
  int? get rowCount;

  @BuiltValueField(wireName: r'failureCode')
  String? get failureCode;

  AuditExport._();

  factory AuditExport([void updates(AuditExportBuilder b)]) = _$AuditExport;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AuditExportBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AuditExport> get serializer => _$AuditExportSerializer();
}

class _$AuditExportSerializer implements PrimitiveSerializer<AuditExport> {
  @override
  final Iterable<Type> types = const [AuditExport, _$AuditExport];

  @override
  final String wireName = r'AuditExport';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AuditExport object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(AuditExportStatusEnum),
    );
    yield r'requestedAt';
    yield serializers.serialize(
      object.requestedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.completedAt != null) {
      yield r'completedAt';
      yield serializers.serialize(
        object.completedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'expiresAt';
    yield serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.rowCount != null) {
      yield r'rowCount';
      yield serializers.serialize(
        object.rowCount,
        specifiedType: const FullType(int),
      );
    }
    if (object.failureCode != null) {
      yield r'failureCode';
      yield serializers.serialize(
        object.failureCode,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    AuditExport object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AuditExportBuilder result,
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AuditExportStatusEnum),
          ) as AuditExportStatusEnum;
          result.status = valueDes;
          break;
        case r'requestedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.requestedAt = valueDes;
          break;
        case r'completedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.completedAt = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiresAt = valueDes;
          break;
        case r'rowCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rowCount = valueDes;
          break;
        case r'failureCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.failureCode = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AuditExport deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AuditExportBuilder();
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

class AuditExportStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'QUEUED')
  static const AuditExportStatusEnum QUEUED = _$auditExportStatusEnum_QUEUED;
  @BuiltValueEnumConst(wireName: r'RUNNING')
  static const AuditExportStatusEnum RUNNING = _$auditExportStatusEnum_RUNNING;
  @BuiltValueEnumConst(wireName: r'READY')
  static const AuditExportStatusEnum READY = _$auditExportStatusEnum_READY;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const AuditExportStatusEnum FAILED = _$auditExportStatusEnum_FAILED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const AuditExportStatusEnum EXPIRED = _$auditExportStatusEnum_EXPIRED;

  static Serializer<AuditExportStatusEnum> get serializer => _$auditExportStatusEnumSerializer;

  const AuditExportStatusEnum._(String name): super(name);

  static BuiltSet<AuditExportStatusEnum> get values => _$auditExportStatusEnumValues;
  static AuditExportStatusEnum valueOf(String name) => _$auditExportStatusEnumValueOf(name);
}


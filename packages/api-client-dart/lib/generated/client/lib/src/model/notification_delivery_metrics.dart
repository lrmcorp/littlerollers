//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'notification_delivery_metrics.g.dart';

/// NotificationDeliveryMetrics
///
/// Properties:
/// * [totalCount] 
/// * [pendingCount] 
/// * [acceptedCount] 
/// * [terminalFailureCount] 
/// * [deadLetterCount] 
/// * [retryCount] 
/// * [rateLimitWaitCount] 
/// * [queueAgeSeconds] 
/// * [acceptedRateBasisPoints] 
/// * [failureRateBasisPoints] 
/// * [byStatus] 
@BuiltValue()
abstract class NotificationDeliveryMetrics implements Built<NotificationDeliveryMetrics, NotificationDeliveryMetricsBuilder> {
  @BuiltValueField(wireName: r'totalCount')
  int get totalCount;

  @BuiltValueField(wireName: r'pendingCount')
  int get pendingCount;

  @BuiltValueField(wireName: r'acceptedCount')
  int get acceptedCount;

  @BuiltValueField(wireName: r'terminalFailureCount')
  int get terminalFailureCount;

  @BuiltValueField(wireName: r'deadLetterCount')
  int get deadLetterCount;

  @BuiltValueField(wireName: r'retryCount')
  int get retryCount;

  @BuiltValueField(wireName: r'rateLimitWaitCount')
  int get rateLimitWaitCount;

  @BuiltValueField(wireName: r'queueAgeSeconds')
  int get queueAgeSeconds;

  @BuiltValueField(wireName: r'acceptedRateBasisPoints')
  int get acceptedRateBasisPoints;

  @BuiltValueField(wireName: r'failureRateBasisPoints')
  int get failureRateBasisPoints;

  @BuiltValueField(wireName: r'byStatus')
  BuiltMap<String, int> get byStatus;

  NotificationDeliveryMetrics._();

  factory NotificationDeliveryMetrics([void updates(NotificationDeliveryMetricsBuilder b)]) = _$NotificationDeliveryMetrics;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(NotificationDeliveryMetricsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<NotificationDeliveryMetrics> get serializer => _$NotificationDeliveryMetricsSerializer();
}

class _$NotificationDeliveryMetricsSerializer implements PrimitiveSerializer<NotificationDeliveryMetrics> {
  @override
  final Iterable<Type> types = const [NotificationDeliveryMetrics, _$NotificationDeliveryMetrics];

  @override
  final String wireName = r'NotificationDeliveryMetrics';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    NotificationDeliveryMetrics object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'totalCount';
    yield serializers.serialize(
      object.totalCount,
      specifiedType: const FullType(int),
    );
    yield r'pendingCount';
    yield serializers.serialize(
      object.pendingCount,
      specifiedType: const FullType(int),
    );
    yield r'acceptedCount';
    yield serializers.serialize(
      object.acceptedCount,
      specifiedType: const FullType(int),
    );
    yield r'terminalFailureCount';
    yield serializers.serialize(
      object.terminalFailureCount,
      specifiedType: const FullType(int),
    );
    yield r'deadLetterCount';
    yield serializers.serialize(
      object.deadLetterCount,
      specifiedType: const FullType(int),
    );
    yield r'retryCount';
    yield serializers.serialize(
      object.retryCount,
      specifiedType: const FullType(int),
    );
    yield r'rateLimitWaitCount';
    yield serializers.serialize(
      object.rateLimitWaitCount,
      specifiedType: const FullType(int),
    );
    yield r'queueAgeSeconds';
    yield serializers.serialize(
      object.queueAgeSeconds,
      specifiedType: const FullType(int),
    );
    yield r'acceptedRateBasisPoints';
    yield serializers.serialize(
      object.acceptedRateBasisPoints,
      specifiedType: const FullType(int),
    );
    yield r'failureRateBasisPoints';
    yield serializers.serialize(
      object.failureRateBasisPoints,
      specifiedType: const FullType(int),
    );
    yield r'byStatus';
    yield serializers.serialize(
      object.byStatus,
      specifiedType: const FullType(BuiltMap, [FullType(String), FullType(int)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    NotificationDeliveryMetrics object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required NotificationDeliveryMetricsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'totalCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.totalCount = valueDes;
          break;
        case r'pendingCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pendingCount = valueDes;
          break;
        case r'acceptedCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.acceptedCount = valueDes;
          break;
        case r'terminalFailureCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.terminalFailureCount = valueDes;
          break;
        case r'deadLetterCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.deadLetterCount = valueDes;
          break;
        case r'retryCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.retryCount = valueDes;
          break;
        case r'rateLimitWaitCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rateLimitWaitCount = valueDes;
          break;
        case r'queueAgeSeconds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.queueAgeSeconds = valueDes;
          break;
        case r'acceptedRateBasisPoints':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.acceptedRateBasisPoints = valueDes;
          break;
        case r'failureRateBasisPoints':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.failureRateBasisPoints = valueDes;
          break;
        case r'byStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltMap, [FullType(String), FullType(int)]),
          ) as BuiltMap<String, int>;
          result.byStatus.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  NotificationDeliveryMetrics deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = NotificationDeliveryMetricsBuilder();
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

